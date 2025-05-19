
import offlineStorage from './factory';
import { STORAGE_KEYS, OfflineAction, MAX_RETRY_COUNT } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Queue an action for offline processing
 * @param action Action to queue
 */
export const queueOfflineAction = async (action: Partial<OfflineAction>): Promise<void> => {
  try {
    // Get existing pending actions
    const pendingActions = await getPendingActions();
    
    // Create new action with ID and timestamp
    const newAction: OfflineAction = {
      id: action.id || uuidv4(),
      type: action.type || 'unknown',
      payload: action.payload || {},
      timestamp: action.timestamp || Date.now(),
      retryCount: 0
    };
    
    // Add to pending actions and save
    pendingActions.push(newAction);
    await offlineStorage.set(STORAGE_KEYS.PENDING_ACTIONS, pendingActions);
    
    console.log(`Action queued for offline processing: ${newAction.type}`);
  } catch (error) {
    console.error('Error queueing offline action:', error);
    throw error;
  }
};

/**
 * Get all pending actions
 */
export const getPendingActions = async (): Promise<OfflineAction[]> => {
  try {
    const actions = await offlineStorage.get<OfflineAction[]>(STORAGE_KEYS.PENDING_ACTIONS);
    return actions || [];
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
};

/**
 * Remove a specific pending action
 * @param actionId ID of the action to remove
 */
export const removePendingAction = async (actionId: string): Promise<void> => {
  try {
    // Get all actions and filter out the specified ID
    const actions = await getPendingActions();
    const filteredActions = actions.filter(action => action.id !== actionId);
    
    // Save the updated list
    await offlineStorage.set(STORAGE_KEYS.PENDING_ACTIONS, filteredActions);
  } catch (error) {
    console.error('Error removing pending action:', error);
    throw error;
  }
};

/**
 * Increment the retry count for an action
 * @param actionId ID of the action to update
 */
export const incrementRetryCount = async (actionId: string): Promise<void> => {
  try {
    const actions = await getPendingActions();
    const updatedActions = actions.map(action => {
      if (action.id === actionId) {
        return {
          ...action,
          retryCount: (action.retryCount || 0) + 1
        };
      }
      return action;
    });
    
    await offlineStorage.set(STORAGE_KEYS.PENDING_ACTIONS, updatedActions);
  } catch (error) {
    console.error('Error incrementing retry count:', error);
    throw error;
  }
};

/**
 * Check if an action has exceeded maximum retry attempts
 * @param actionId ID of the action to check
 */
export const hasExceededRetryLimit = async (actionId: string): Promise<boolean> => {
  try {
    const actions = await getPendingActions();
    const action = actions.find(a => a.id === actionId);
    
    if (!action) {
      return false;
    }
    
    return (action.retryCount || 0) >= MAX_RETRY_COUNT;
  } catch (error) {
    console.error('Error checking retry limit:', error);
    return false;
  }
};
