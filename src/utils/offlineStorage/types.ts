
// Interface definitions for the offline storage system

// Interface defining offline action for queuing operations to be executed later
export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount?: number;
}

// Interface for offline storage
export interface OfflineStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  keys(): Promise<string[]>;
  clear(): Promise<void>;
}

// Constants used throughout the storage modules
export const STORAGE_KEYS = {
  PENDING_ACTIONS: 'pending_actions',
  ACTIVE_ORDERS: 'active_orders',
  CART: 'cart'
};

// Configuration constants
export const MAX_RETRY_COUNT = 3;
