
import { Preferences } from '@capacitor/preferences';
import { Platform } from './platform';

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

// Storage constants
const PENDING_ACTIONS_KEY = 'pending_actions';
const ACTIVE_ORDERS_KEY = 'active_orders';
const MAX_RETRY_COUNT = 3;

// Web implementation using IndexedDB
class WebStorage implements OfflineStorage {
  private dbName = 'offlineAppStorage';
  private dbVersion = 1;
  private storeName = 'keyValueStore';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDatabase();
  }

  private async initDatabase(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('Error opening IndexedDB');
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  private async getDatabase(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return this.initDatabase();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
        
        request.onerror = () => {
          console.error('Error getting item from IndexedDB:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
      });
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
      // Fall back to localStorage as a backup
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (fallbackError) {
        console.error('Error using localStorage fallback:', fallbackError);
        return null;
      }
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, key);
        
        request.onerror = () => {
          console.error('Error setting item in IndexedDB:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
      // Fall back to localStorage as a backup
      try {
        localStorage.setItem(key, JSON.stringify(value));
        resolve();
      } catch (fallbackError) {
        console.error('Error using localStorage fallback:', fallbackError);
        reject(fallbackError);
      }
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);
        
        request.onerror = () => {
          console.error('Error removing item from IndexedDB:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
      // Fall back to localStorage as a backup
      try {
        localStorage.removeItem(key);
        resolve();
      } catch (fallbackError) {
        console.error('Error using localStorage fallback:', fallbackError);
        reject(fallbackError);
      }
    }
  }

  async keys(): Promise<string[]> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAllKeys();
        
        request.onerror = () => {
          console.error('Error getting keys from IndexedDB:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve(request.result.map(key => String(key)));
        };
      });
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
      // Fall back to localStorage as a backup
      try {
        return Object.keys(localStorage);
      } catch (fallbackError) {
        console.error('Error using localStorage fallback:', fallbackError);
        return [];
      }
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();
        
        request.onerror = () => {
          console.error('Error clearing IndexedDB:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
      // Fall back to localStorage as a backup
      try {
        localStorage.clear();
        resolve();
      } catch (fallbackError) {
        console.error('Error using localStorage fallback:', fallbackError);
        reject(fallbackError);
      }
    }
  }
}

// Native implementation using Capacitor Preferences
class NativeStorage implements OfflineStorage {
  async get<T>(key: string): Promise<T | null> {
    try {
      const { value } = await Preferences.get({ key });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting item from native storage:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await Preferences.set({
        key,
        value: JSON.stringify(value),
      });
    } catch (error) {
      console.error('Error setting item in native storage:', error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('Error removing item from native storage:', error);
    }
  }

  async keys(): Promise<string[]> {
    try {
      const { keys } = await Preferences.keys();
      return keys;
    } catch (error) {
      console.error('Error getting keys from native storage:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Error clearing native storage:', error);
    }
  }
}

// Factory function to create the appropriate storage implementation
export const createOfflineStorage = (): OfflineStorage => {
  return Platform.isNative() ? new NativeStorage() : new WebStorage();
};

// Singleton instance
const offlineStorage = createOfflineStorage();

// Utility functions for working with pending actions
export const getPendingActions = async (): Promise<OfflineAction[]> => {
  try {
    const actions = await offlineStorage.get<OfflineAction[]>(PENDING_ACTIONS_KEY);
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
    await offlineStorage.set(PENDING_ACTIONS_KEY, actions);
  } catch (error) {
    console.error('Error queueing offline action:', error);
  }
};

export const removePendingAction = async (actionId: string): Promise<void> => {
  try {
    const actions = await getPendingActions();
    const updatedActions = actions.filter(action => action.id !== actionId);
    await offlineStorage.set(PENDING_ACTIONS_KEY, updatedActions);
  } catch (error) {
    console.error('Error removing pending action:', error);
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
    
    await offlineStorage.set(PENDING_ACTIONS_KEY, updatedActions);
  } catch (error) {
    console.error('Error incrementing retry count:', error);
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
    await offlineStorage.set(PENDING_ACTIONS_KEY, []);
  } catch (error) {
    console.error('Error clearing pending actions:', error);
  }
};

// Utility functions for working with active orders
export const getActiveOrders = async (): Promise<any[]> => {
  try {
    const orders = await offlineStorage.get<any[]>(ACTIVE_ORDERS_KEY);
    return orders || [];
  } catch (error) {
    console.error('Error getting active orders:', error);
    return [];
  }
};

export const storeActiveOrder = async (order: any): Promise<void> => {
  try {
    const orders = await getActiveOrders();
    
    // Check if the order already exists
    const existingIndex = orders.findIndex(o => o.id === order.id);
    
    if (existingIndex >= 0) {
      // Update existing order
      orders[existingIndex] = order;
    } else {
      // Add new order
      orders.push(order);
    }
    
    await offlineStorage.set(ACTIVE_ORDERS_KEY, orders);
  } catch (error) {
    console.error('Error storing active order:', error);
  }
};

export const getActiveOrder = async (orderId: string): Promise<any | null> => {
  try {
    const orders = await getActiveOrders();
    return orders.find(order => order.id === orderId) || null;
  } catch (error) {
    console.error('Error getting active order:', error);
    return null;
  }
};

export default offlineStorage;
