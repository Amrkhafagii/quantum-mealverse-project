
import offlineStorage from './factory';
import { OfflineAction, STORAGE_KEYS } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all pending offline actions
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
 * Add a new pending action
 * @param type Action type
 * @param payload Action payload
 */
export const addPendingAction = async (type: string, payload: any): Promise<string> => {
  try {
    const actions = await getPendingActions();
    const newAction: OfflineAction = {
      id: uuidv4(),
      type,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    actions.push(newAction);
    await offlineStorage.set(STORAGE_KEYS.PENDING_ACTIONS, actions);
    return newAction.id;
  } catch (error) {
    console.error('Error adding pending action:', error);
    throw error;
  }
};

/**
 * Remove a pending action by ID
 * @param id Action ID to remove
 */
export const removePendingAction = async (id: string): Promise<void> => {
  try {
    const actions = await getPendingActions();
    const updatedActions = actions.filter(action => action.id !== id);
    await offlineStorage.set(STORAGE_KEYS.PENDING_ACTIONS, updatedActions);
  } catch (error) {
    console.error(`Error removing pending action ${id}:`, error);
    throw error;
  }
};

/**
 * Increment retry count for an action
 * @param id Action ID
 */
export const incrementRetryCount = async (id: string): Promise<void> => {
  try {
    const actions = await getPendingActions();
    const updatedActions = actions.map(action => {
      if (action.id === id) {
        return {
          ...action,
          retryCount: action.retryCount + 1
        };
      }
      return action;
    });
    
    await offlineStorage.set(STORAGE_KEYS.PENDING_ACTIONS, updatedActions);
  } catch (error) {
    console.error(`Error incrementing retry count for action ${id}:`, error);
    throw error;
  }
};

/**
 * Check if an action has exceeded retry limit
 * @param id Action ID
 * @param limit Optional retry limit (default: 5)
 */
export const hasExceededRetryLimit = async (id: string, limit = 5): Promise<boolean> => {
  try {
    const actions = await getPendingActions();
    const action = actions.find(a => a.id === id);
    
    if (!action) {
      return false;
    }
    
    return action.retryCount >= limit;
  } catch (error) {
    console.error(`Error checking retry limit for action ${id}:`, error);
    return false;
  }
};

/**
 * Clear all pending actions
 */
export const clearAllPendingActions = async (): Promise<void> => {
  try {
    await offlineStorage.set(STORAGE_KEYS.PENDING_ACTIONS, []);
  } catch (error) {
    console.error('Error clearing pending actions:', error);
    throw error;
  }
};
