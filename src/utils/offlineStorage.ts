
import { Order } from '@/types/order';

// Type definitions for offline storage
export interface PendingAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount?: number;
}

export interface OfflineStorageState {
  activeOrders: Record<string, { data: Order; timestamp: number }>;
  pendingActions: PendingAction[];
}

// Constants
const STORAGE_KEY = 'offline_storage_state';
const MAX_RETRY_COUNT = 3;

// Initialize offline storage
const initializeStorage = (): OfflineStorageState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as OfflineStorageState;
    }
  } catch (error) {
    console.error('Error initializing offline storage:', error);
  }

  return {
    activeOrders: {},
    pendingActions: [],
  };
};

// Save the offline state
const saveOfflineState = (state: OfflineStorageState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving offline state:', error);
  }
};

// Get the current offline state
export const getOfflineState = (): OfflineStorageState => {
  return initializeStorage();
};

// Store active orders for offline access
export const storeActiveOrder = (order: Order): void => {
  if (!order.id) return;

  const state = getOfflineState();
  state.activeOrders[order.id] = {
    data: order,
    timestamp: Date.now(),
  };
  saveOfflineState(state);
};

// Retrieve active orders from offline storage
export const getActiveOrders = (): Order[] => {
  const state = getOfflineState();
  return Object.values(state.activeOrders).map(item => item.data);
};

// Get a specific active order
export const getActiveOrder = (orderId: string): Order | null => {
  const state = getOfflineState();
  return state.activeOrders[orderId]?.data || null;
};

// Clear old orders (older than 24 hours)
export const clearOldOrders = (): void => {
  const state = getOfflineState();
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  Object.entries(state.activeOrders).forEach(([id, entry]) => {
    if (now - entry.timestamp > oneDayMs) {
      delete state.activeOrders[id];
    }
  });
  
  saveOfflineState(state);
};

// Add an action to the pending queue
export const queueOfflineAction = (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>): void => {
  const state = getOfflineState();
  
  const newAction: PendingAction = {
    ...action,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retryCount: 0
  };
  
  state.pendingActions.push(newAction);
  saveOfflineState(state);
};

// Get all pending actions
export const getPendingActions = (): PendingAction[] => {
  return getOfflineState().pendingActions;
};

// Remove a pending action by ID
export const removePendingAction = (actionId: string): void => {
  const state = getOfflineState();
  state.pendingActions = state.pendingActions.filter(action => action.id !== actionId);
  saveOfflineState(state);
};

// Increment retry count for a pending action
export const incrementRetryCount = (actionId: string): void => {
  const state = getOfflineState();
  const action = state.pendingActions.find(action => action.id === actionId);
  
  if (action) {
    action.retryCount = (action.retryCount || 0) + 1;
    saveOfflineState(state);
  }
};

// Check if an action has exceeded retry limit
export const hasExceededRetryLimit = (actionId: string): boolean => {
  const state = getOfflineState();
  const action = state.pendingActions.find(action => action.id === actionId);
  return action ? (action.retryCount || 0) >= MAX_RETRY_COUNT : false;
};

// Clear all pending actions
export const clearAllPendingActions = (): void => {
  const state = getOfflineState();
  state.pendingActions = [];
  saveOfflineState(state);
};

// Clear everything from storage
export const clearOfflineStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
