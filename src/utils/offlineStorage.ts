
import { Platform } from './platform';
import { OfflineAction } from './offlineStorage/types';

// Forward exports from the modular system
export type { OfflineStorage } from './offlineStorage/types';
export type { OfflineAction } from './offlineStorage/types';
export { STORAGE_KEYS, MAX_RETRY_COUNT } from './offlineStorage/types';

export { WebStorage } from './offlineStorage/webStorage';
export { NativeStorage } from './offlineStorage/nativeStorage';

// Import the singleton storage instance
import offlineStorage from './offlineStorage/factory';
export default offlineStorage;

// Re-export action service functions
export { 
  getPendingActions, 
  removePendingAction, 
  incrementRetryCount, 
  hasExceededRetryLimit,
  clearAllPendingActions,
  queueOfflineAction
} from './offlineStorage/actionsService';

// Re-export orders service functions
export { 
  getActiveOrders,
  storeActiveOrder,
  getActiveOrder
} from './offlineStorage/ordersService';

// Import action service functions for use in this file
import { 
  getPendingActions, 
  removePendingAction, 
  incrementRetryCount, 
  hasExceededRetryLimit
} from './offlineStorage/actionsService';

/**
 * Generic function to get data from offline storage
 * @param key Storage key
 * @returns The stored data, or null if not found
 */
export async function getOfflineData<T>(key: string): Promise<T | null> {
  try {
    const data = await offlineStorage.get<T>(key);
    return data;
  } catch (error) {
    console.error(`Error getting offline data for key ${key}:`, error);
    return null;
  }
}

/**
 * Generic function to save data to offline storage
 * @param key Storage key
 * @param data Data to store
 */
export async function saveOfflineData<T>(key: string, data: T): Promise<void> {
  try {
    await offlineStorage.set(key, data);
  } catch (error) {
    console.error(`Error saving offline data for key ${key}:`, error);
    throw error;
  }
}

/**
 * Remove data from offline storage
 * @param key Storage key
 */
export async function removeOfflineData(key: string): Promise<void> {
  try {
    await offlineStorage.remove(key);
  } catch (error) {
    console.error(`Error removing offline data for key ${key}:`, error);
    throw error;
  }
}

/**
 * Clear all data from offline storage
 */
export async function clearOfflineData(): Promise<void> {
  try {
    await offlineStorage.clear();
  } catch (error) {
    console.error('Error clearing offline data:', error);
    throw error;
  }
}

/**
 * Process all pending offline actions
 */
export const syncPendingActions = async (): Promise<void> => {
  try {
    const pendingActions = await getPendingActions();
    if (pendingActions.length === 0) {
      console.log('No pending actions to sync');
      return;
    }
    
    console.log(`Processing ${pendingActions.length} pending actions`);
    
    // Process each action sequentially
    for (const action of pendingActions) {
      try {
        // Process based on action type - this would be implemented based on your specific needs
        console.log(`Processing action: ${action.type}`, action);
        
        // If successful, remove the action
        await removePendingAction(action.id);
      } catch (error) {
        console.error(`Error processing action ${action.id}:`, error);
        
        // Increment retry count
        await incrementRetryCount(action.id);
        
        // Check if we've exceeded retry limit
        if (await hasExceededRetryLimit(action.id)) {
          console.warn(`Action ${action.id} exceeded retry limit, removing`);
          await removePendingAction(action.id);
        }
      }
    }
    
    console.log('Finished processing pending actions');
  } catch (error) {
    console.error('Error syncing pending actions:', error);
    throw error;
  }
};
