
import { supabase } from '@/integrations/supabase/client';
import { SyncQueue, SyncOperation } from '@/types/sync';
import { NetworkStatus } from '@/types/network';
import { toast } from '@/hooks/use-toast';
import { StorageManager } from '@/utils/storage/StorageManager';

// Maximum number of retries for a sync operation
const MAX_RETRIES = 5;

// Base delay for exponential backoff (in milliseconds)
const BASE_DELAY = 1000;

// Create storage manager instance for sync operations
const syncStorage = StorageManager.getInstance('sync');

// Define supported tables - this must match the table names in Supabase
const SUPPORTED_TABLES = ['orders', 'user_preferences'] as const;

type SupportedTable = typeof SUPPORTED_TABLES[number];

// Type guard to check if a string is a supported table name
function isSupportedTable(table: string): table is SupportedTable {
  return (SUPPORTED_TABLES as readonly string[]).includes(table);
}

/**
 * Get the sync queue from storage
 */
export async function getSyncQueue(): Promise<SyncQueue> {
  const queue = await syncStorage.getItem<SyncQueue>('syncQueue');
  return queue || { operations: [], lastSync: null };
}

/**
 * Save the sync queue to storage
 */
export async function saveSyncQueue(queue: SyncQueue): Promise<void> {
  await syncStorage.setItem('syncQueue', queue);
}

/**
 * Add an operation to the sync queue
 */
export async function addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'createdAt' | 'retries'>): Promise<SyncQueue> {
  const queue = await getSyncQueue();
  
  const newOperation: SyncOperation = {
    ...operation,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
    retries: 0
  };
  
  queue.operations.push(newOperation);
  await saveSyncQueue(queue);
  
  return queue;
}

/**
 * Remove an operation from the sync queue
 */
export async function removeFromSyncQueue(operationId: string): Promise<SyncQueue> {
  const queue = await getSyncQueue();
  queue.operations = queue.operations.filter(op => op.id !== operationId);
  await saveSyncQueue(queue);
  return queue;
}

/**
 * Process sync operations with exponential backoff
 */
export async function processSync(networkStatus: NetworkStatus): Promise<boolean> {
  if (!networkStatus.isOnline) {
    console.log('Cannot sync: offline');
    return false;
  }
  
  const queue = await getSyncQueue();
  
  if (queue.operations.length === 0) {
    console.log('No operations to sync');
    return true;
  }
  
  console.log(`Processing ${queue.operations.length} sync operations`);
  let success = true;
  
  // Process operations in order
  for (const operation of [...queue.operations]) {
    // Skip operations that have exceeded max retries
    if (operation.retries >= MAX_RETRIES) {
      console.warn(`Sync operation ${operation.id} exceeded max retries:`, operation);
      toast({
        title: "Sync operation failed",
        description: `The operation ${operation.type} could not be completed after multiple attempts.`,
        variant: "destructive"
      });
      
      // Remove from queue to prevent endless retries
      await removeFromSyncQueue(operation.id);
      success = false;
      continue;
    }
    
    try {
      // Different handling based on operation type
      switch (operation.type) {
        case 'insert':
          await processInsertOperation(operation);
          break;
          
        case 'update':
          await processUpdateOperation(operation);
          break;
          
        case 'delete':
          await processDeleteOperation(operation);
          break;
          
        default:
          console.error(`Unknown sync operation type: ${operation.type}`);
          break;
      }
      
      // If we got here, the operation was successful, so remove it from queue
      await removeFromSyncQueue(operation.id);
      
    } catch (error) {
      console.error(`Error processing sync operation ${operation.id}:`, error);
      success = false;
      
      // Increment retry count
      const updatedQueue = await getSyncQueue();
      const operationIndex = updatedQueue.operations.findIndex(op => op.id === operation.id);
      
      if (operationIndex >= 0) {
        updatedQueue.operations[operationIndex].retries += 1;
        updatedQueue.operations[operationIndex].lastError = String(error);
        
        // Calculate backoff delay
        const backoffDelay = BASE_DELAY * Math.pow(2, updatedQueue.operations[operationIndex].retries);
        updatedQueue.operations[operationIndex].nextRetry = new Date(Date.now() + backoffDelay).toISOString();
        
        await saveSyncQueue(updatedQueue);
      }
    }
  }
  
  // Update last sync time if any operation was successful
  if (success) {
    queue.lastSync = new Date().toISOString();
    await saveSyncQueue(queue);
  }
  
  return success;
}

/**
 * Process an insert operation
 */
async function processInsertOperation(operation: SyncOperation): Promise<void> {
  const { table, data } = operation;
  
  if (!isSupportedTable(table)) {
    throw new Error(`Unsupported table: ${table}`);
  }
  
  // If we have an optimistic id, we need to remove it before inserting
  const { optimisticId, ...insertData } = data || {};
  
  // Handle tables with updated_at or last_modified columns
  const tableHasTimestamps = ['orders', 'user_preferences'].includes(table);
  
  // Add server_timestamp if needed
  if (tableHasTimestamps) {
    (insertData as any).updated_at = new Date().toISOString();
  }
  
  // Perform the insert operation
  const { data: result, error } = await supabase
    .from(table)
    .insert(insertData)
    .select();
    
  if (error) {
    throw new Error(`Failed to insert into ${table}: ${error.message}`);
  }
  
  // Update local cache with server data if needed
  if (result && result.length > 0 && operation.localStorageKey) {
    const localData = await syncStorage.getItem(operation.localStorageKey);
    
    if (localData) {
      // Handle collections vs single objects
      if (Array.isArray(localData)) {
        const updatedItems = localData.map(item => 
          (item.optimisticId && item.optimisticId === optimisticId) ? { ...result[0] } : item
        );
        await syncStorage.setItem(operation.localStorageKey, updatedItems);
      } else {
        await syncStorage.setItem(operation.localStorageKey, result[0]);
      }
    }
  }
}

/**
 * Process an update operation
 */
async function processUpdateOperation(operation: SyncOperation): Promise<void> {
  const { table, data, filters } = operation;
  
  if (!isSupportedTable(table)) {
    throw new Error(`Unsupported table: ${table}`);
  }
  
  // Handle tables with updated_at columns
  const updatedData = { ...data };
  if (['orders', 'user_preferences'].includes(table)) {
    updatedData.updated_at = new Date().toISOString();
  }
  
  // Build the query
  let query = supabase.from(table).update(updatedData);
  
  // Apply filters if available
  if (filters) {
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (query) {
        // @ts-ignore - We're dynamically applying filters
        query = query.eq(key, value);
      }
    });
  }
  
  const { error } = await query;
  
  if (error) {
    throw new Error(`Failed to update ${table}: ${error.message}`);
  }
}

/**
 * Process a delete operation
 */
async function processDeleteOperation(operation: SyncOperation): Promise<void> {
  const { table, filters } = operation;
  
  if (!isSupportedTable(table)) {
    throw new Error(`Unsupported table: ${table}`);
  }
  
  if (!filters || Object.keys(filters).length === 0) {
    throw new Error(`Delete operation requires filters`);
  }
  
  // Build the query
  let query = supabase.from(table).delete();
  
  // Apply filters
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    if (query) {
      // @ts-ignore - We're dynamically applying filters
      query = query.eq(key, value);
    }
  });
  
  const { error } = await query;
  
  if (error) {
    throw new Error(`Failed to delete from ${table}: ${error.message}`);
  }
}

/**
 * Check if any operations in the queue are ready for retry
 */
export async function getReadyRetries(): Promise<SyncOperation[]> {
  const queue = await getSyncQueue();
  const now = new Date();
  
  return queue.operations.filter(operation => {
    if (!operation.nextRetry) return true;
    const retryTime = new Date(operation.nextRetry);
    return retryTime <= now;
  });
}

/**
 * Get the sync status
 */
export async function getSyncStatus(): Promise<{
  pendingOperations: number;
  lastSync: string | null;
  hasFailedOperations: boolean;
}> {
  const queue = await getSyncQueue();
  
  const failedOperations = queue.operations.filter(op => op.retries >= MAX_RETRIES);
  
  return {
    pendingOperations: queue.operations.length,
    lastSync: queue.lastSync,
    hasFailedOperations: failedOperations.length > 0
  };
}

/**
 * Main entry point for syncing pending actions
 */
export async function syncPendingActions(): Promise<boolean> {
  // Create a dummy network status as online
  const networkStatus: NetworkStatus = {
    isOnline: true
  };
  
  return processSync(networkStatus);
}
