
import offlineStorage from './factory';
import { OfflineAction, STORAGE_KEYS, MAX_RETRY_COUNT } from './types';

// Utility functions for working with pending actions
export const getPendingActions = async (): Promise<OfflineAction[]> => {
  try {
    const actions = await offlineStorage.get<OfflineAction[]>(STORAGE_KEYS.PENDING_ACTIONS);
    return actions || [];
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
};

export const queueOfflineAction = async (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> => {
  try {
    const actions = await getPendingActions();
    
    // Generate a unique ID
    const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newAction: OfflineAction = {
      ...action,
      id,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    actions.push(newAction);
    await offlineStorage.set(STORAGE_KEYS.PENDING_ACTIONS, actions);
  } catch (error) {
    console.error('Error queueing offline action:', error);
    throw error;
  }
};

export const removePendingAction = async (actionId: string): Promise<void> => {
  try {
    const actions = await getPendingActions();
    const updatedActions = actions.filter(action => action.id !== actionId);
    await offlineStorage.set(STORAGE_KEYS.PENDING_ACTIONS, updatedActions);
  } catch (error) {
    console.error('Error removing pending action:', error);
    throw error;
  }
};

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

export const hasExceededRetryLimit = async (actionId: string): Promise<boolean> => {
  try {
    const actions = await getPendingActions();
    const action = actions.find(a => a.id === actionId);
    
    if (!action) return false;
    
    return (action.retryCount || 0) >= MAX_RETRY_COUNT;
  } catch (error) {
    console.error('Error checking retry limit:', error);
    return false;
  }
};

export const clearAllPendingActions = async (): Promise<void> => {
  try {
    await offlineStorage.set(STORAGE_KEYS.PENDING_ACTIONS, []);
  } catch (error) {
    console.error('Error clearing pending actions:', error);
    throw error;
  }
};
