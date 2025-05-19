
import { OfflineStorage } from './types';

/**
 * Web implementation of offline storage using IndexedDB
 * with localStorage fallback when IndexedDB is unavailable
 */
export class WebStorage implements OfflineStorage {
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
      return new Promise<T | null>((resolve, reject) => {
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
      return new Promise<void>((resolve, reject) => {
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
        return Promise.resolve();
      } catch (fallbackError) {
        console.error('Error using localStorage fallback:', fallbackError);
        return Promise.reject(fallbackError);
      }
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      return new Promise<void>((resolve, reject) => {
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
        return Promise.resolve();
      } catch (fallbackError) {
        console.error('Error using localStorage fallback:', fallbackError);
        return Promise.reject(fallbackError);
      }
    }
  }

  async keys(): Promise<string[]> {
    try {
      const db = await this.getDatabase();
      return new Promise<string[]>((resolve, reject) => {
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
        return Promise.resolve(Object.keys(localStorage));
      } catch (fallbackError) {
        console.error('Error using localStorage fallback:', fallbackError);
        return Promise.resolve([]);
      }
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getDatabase();
      return new Promise<void>((resolve, reject) => {
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
        return Promise.resolve();
      } catch (fallbackError) {
        console.error('Error using localStorage fallback:', fallbackError);
        return Promise.reject(fallbackError);
      }
    }
  }
}
