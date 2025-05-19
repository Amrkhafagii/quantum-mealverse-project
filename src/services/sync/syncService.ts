import { supabase } from '@/integrations/supabase/client';
import { SyncOperation, SyncQueue } from '@/types/sync';
import { Platform } from '@/utils/platform';

// Storage key for pending actions
const SYNC_QUEUE_KEY = 'offline_sync_queue';
const LAST_SYNC_KEY = 'last_sync_timestamp';

/**
 * Get the current sync queue from storage
 */
export const getSyncQueue = async (): Promise<SyncQueue> => {
  try {
    // Try to load from storage
    const storedQueue = localStorage.getItem(SYNC_QUEUE_KEY);
    if (storedQueue) {
      return JSON.parse(storedQueue);
    }
  } catch (error) {
    console.error('Error retrieving sync queue:', error);
  }

  // Return empty queue if not found or error
  return {
    operations: [],
    lastSync: null
  };
};

/**
 * Save the sync queue to storage
 */
export const saveSyncQueue = async (queue: SyncQueue): Promise<void> => {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving sync queue:', error);
  }
};

/**
 * Add an operation to the sync queue
 */
export const addToSyncQueue = async (operation: Omit<SyncOperation, 'id' | 'createdAt' | 'retries'>): Promise<void> => {
  try {
    const queue = await getSyncQueue();
    
    // Create a full operation object
    const fullOperation: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      retries: 0,
    };
    
    // Add to queue
    queue.operations.push(fullOperation);
    
    // Save updated queue
    await saveSyncQueue(queue);
    
    console.log(`Added ${operation.type} operation to sync queue for ${operation.table}`);
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
};

/**
 * Process all pending operations in the sync queue
 */
export const syncPendingActions = async (): Promise<boolean> => {
  // Check if we're online
  if (!navigator.onLine && Platform.isWeb()) {
    console.log('Device is offline, skipping sync');
    return false;
  }

  try {
    console.log('Starting sync of pending actions');
    
    // Get the current queue
    const queue = await getSyncQueue();
    
    if (queue.operations.length === 0) {
      console.log('No pending operations to sync');
      
      // Update last sync time even if there were no operations
      queue.lastSync = new Date().toISOString();
      await saveSyncQueue(queue);
      
      return true;
    }
    
    // Process each operation in order
    const remainingOperations: SyncOperation[] = [];
    
    for (const operation of queue.operations) {
      try {
        await processOperation(operation);
        
        // If we get here, the operation was successful
        console.log(`Successfully processed operation ${operation.id} (${operation.type} on ${operation.table})`);
      } catch (error) {
        console.error(`Error processing operation ${operation.id}:`, error);
        
        // Increment retry count
        const updatedOperation = {
          ...operation,
          retries: operation.retries + 1,
          lastError: error instanceof Error ? error.message : 'Unknown error',
          nextRetry: new Date(Date.now() + 60000).toISOString() // Retry in 1 minute
        };
        
        // Keep operation in queue if we haven't exceeded max retries
        if (updatedOperation.retries < 5) {
          remainingOperations.push(updatedOperation);
        } else {
          console.error(`Dropping operation ${operation.id} after ${updatedOperation.retries} failed attempts`);
        }
      }
    }
    
    // Update queue with remaining operations and last sync time
    queue.operations = remainingOperations;
    queue.lastSync = new Date().toISOString();
    
    await saveSyncQueue(queue);
    
    console.log(`Sync completed. ${queue.operations.length === 0 ? 'All operations processed.' : `${queue.operations.length} operations pending.`}`);
    
    return queue.operations.length === 0;
  } catch (error) {
    console.error('Error during sync process:', error);
    return false;
  }
};

/**
 * Process a single sync operation
 */
const processOperation = async (operation: SyncOperation): Promise<void> => {
  switch (operation.type) {
    case 'insert':
      await supabase.from(operation.table).insert(operation.data);
      break;
      
    case 'update':
      if (!operation.filters) {
        throw new Error('Update operation requires filters');
      }
      await supabase.from(operation.table).update(operation.data).match(operation.filters);
      break;
      
    case 'delete':
      if (!operation.filters) {
        throw new Error('Delete operation requires filters');
      }
      await supabase.from(operation.table).delete().match(operation.filters);
      break;
      
    default:
      throw new Error(`Unknown operation type: ${operation.type}`);
  }
};

/**
 * Get the timestamp of the last successful sync
 */
export const getLastSyncTimestamp = async (): Promise<string | null> => {
  try {
    const queue = await getSyncQueue();
    return queue.lastSync;
  } catch (error) {
    console.error('Error getting last sync timestamp:', error);
    return null;
  }
};
