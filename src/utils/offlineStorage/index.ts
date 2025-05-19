
import offlineStorage from './factory';
import { STORAGE_KEYS, OfflineAction } from './types';
import { getPendingActions, removePendingAction, incrementRetryCount, hasExceededRetryLimit, clearAllPendingActions } from './actionsService';

// Export the action service functions
export { 
  getPendingActions, 
  removePendingAction, 
  incrementRetryCount, 
  hasExceededRetryLimit,
  clearAllPendingActions
};

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
        
        // Here you would implement the logic to process each action type
        // For example:
        /*
        switch (action.type) {
          case 'create_order':
            await processCreateOrder(action.payload);
            break;
          case 'update_order':
            await processUpdateOrder(action.payload);
            break;
          // Handle other action types
        }
        */
        
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

export default offlineStorage;
