
import { Platform } from '@/utils/platform';

/**
 * A storage manager class that provides a unified interface for storing data
 * across different platforms and storage types
 */
export class StorageManager {
  private static instances: Record<string, StorageManager> = {};
  private namespace: string;
  private preferencesModule: any = null;
  private isPreferencesLoaded = false;
  private preferencesLoadPromise: Promise<any> | null = null;
  
  private constructor(namespace: string) {
    this.namespace = namespace;
    // Initialize Preferences module if on native platform
    if (Platform.isNative()) {
      this.preferencesLoadPromise = this.loadPreferencesModule();
    }
  }
  
  /**
   * Get an instance of StorageManager with a specific namespace
   */
  public static getInstance(namespace: string): StorageManager {
    if (!StorageManager.instances[namespace]) {
      StorageManager.instances[namespace] = new StorageManager(namespace);
    }
    return StorageManager.instances[namespace];
  }
  
  /**
   * Load Preferences module dynamically with retry mechanism
   */
  private async loadPreferencesModule(): Promise<any> {
    if (this.isPreferencesLoaded && this.preferencesModule) {
      return this.preferencesModule;
    }
    
    // Implement retry mechanism for loading preferences
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        // Using dynamic import to avoid build-time analysis
        const importModule = new Function('return import("@capacitor/preferences")')();
        const module = await importModule;
        this.preferencesModule = module.Preferences;
        this.isPreferencesLoaded = true;
        console.log('Successfully loaded Capacitor Preferences');
        return this.preferencesModule;
      } catch (error) {
        retries++;
        console.warn(`Error loading Capacitor Preferences (attempt ${retries}/${maxRetries}):`, error);
        
        if (retries >= maxRetries) {
          console.error('Failed to load Capacitor Preferences after maximum retries');
          // Don't throw here - we'll fall back to localStorage
          return null;
        }
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries)));
      }
    }
    
    return null;
  }
  
  /**
   * Generate a key with namespace
   */
  private getNamespacedKey(key: string): string {
    return `${this.namespace}:${key}`;
  }
  
  /**
   * Check if Preferences module is available
   */
  private async isPreferencesAvailable(): Promise<boolean> {
    if (this.isPreferencesLoaded) return true;
    if (!Platform.isNative()) return false;
    
    try {
      const module = await this.preferencesLoadPromise;
      return !!module;
    } catch {
      return false;
    }
  }
  
  /**
   * Set an item in storage with better error handling
   */
  public async setItem<T>(key: string, value: T): Promise<void> {
    const namespacedKey = this.getNamespacedKey(key);
    const stringifiedValue = JSON.stringify(value);
    
    // Try native storage first if on native platform
    if (await this.isPreferencesAvailable()) {
      try {
        await this.preferencesModule.set({
          key: namespacedKey,
          value: stringifiedValue
        });
        return;
      } catch (error) {
        console.warn('Native storage failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage with error handling
    try {
      localStorage.setItem(namespacedKey, stringifiedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      // If localStorage fails (quota exceeded, private browsing), try to remove some items
      this.handleStorageError(error);
      // Try again with localStorage
      try {
        localStorage.setItem(namespacedKey, stringifiedValue);
      } catch (retryError) {
        console.error('Failed to save to localStorage even after cleanup:', retryError);
      }
    }
  }
  
  /**
   * Get an item from storage with better error handling
   */
  public async getItem<T>(key: string): Promise<T | null> {
    const namespacedKey = this.getNamespacedKey(key);
    
    // Try native storage first if on native platform
    if (await this.isPreferencesAvailable()) {
      try {
        const { value } = await this.preferencesModule.get({ key: namespacedKey });
        if (!value) return null;
        
        try {
          return JSON.parse(value) as T;
        } catch (parseError) {
          console.warn('Failed to parse value from native storage:', parseError);
          return null;
        }
      } catch (error) {
        console.warn('Error getting from native storage, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage with error handling
    try {
      const value = localStorage.getItem(namespacedKey);
      if (!value) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch (parseError) {
        console.warn('Failed to parse value from localStorage:', parseError);
        return null;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }
  
  /**
   * Remove an item from storage with better error handling
   */
  public async removeItem(key: string): Promise<void> {
    const namespacedKey = this.getNamespacedKey(key);
    
    // Try native storage first if on native platform
    if (await this.isPreferencesAvailable()) {
      try {
        await this.preferencesModule.remove({ key: namespacedKey });
        return;
      } catch (error) {
        console.warn('Error removing from native storage, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      localStorage.removeItem(namespacedKey);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
  
  /**
   * Handle storage errors by cleaning up old data if possible
   */
  private handleStorageError(error: any): void {
    // If we're out of space, try to clean up some old items
    try {
      const totalItems = localStorage.length;
      if (totalItems > 20) {  // If we have more than 20 items
        // Remove oldest items first (up to 5 items)
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length && keysToRemove.length < 5; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`${this.namespace}:`)) {
            keysToRemove.push(key);
          }
        }
        
        // Remove the collected keys
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
            console.log('Removed old storage item:', key);
          } catch (e) {
            // Ignore errors during cleanup
          }
        });
      }
    } catch (cleanupError) {
      console.error('Error during storage cleanup:', cleanupError);
    }
  }
  
  /**
   * Clear all items in this namespace with better error handling
   */
  public async clear(): Promise<void> {
    if (await this.isPreferencesAvailable()) {
      try {
        const { keys } = await this.preferencesModule.keys();
        const namespacedKeys = keys.filter(k => k.startsWith(`${this.namespace}:`));
        
        for (const key of namespacedKeys) {
          try {
            await this.preferencesModule.remove({ key });
          } catch (error) {
            console.warn(`Failed to remove key ${key} from native storage:`, error);
          }
        }
      } catch (error) {
        console.error('Error clearing native storage:', error);
        // Fall back to localStorage clearing
        this.clearLocalStorage();
      }
    } else {
      this.clearLocalStorage();
    }
  }
  
  private clearLocalStorage(): void {
    // For localStorage, iterate through all keys and remove those in our namespace
    const namespacedPrefix = `${this.namespace}:`;
    
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(namespacedPrefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove keys in a separate pass to avoid index shifting issues
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove key ${key} from localStorage:`, e);
        }
      });
    } catch (error) {
      console.error('Error during localStorage cleanup:', error);
    }
  }
  
  /**
   * Get all keys in this namespace with better error handling
   */
  public async keys(): Promise<string[]> {
    const namespacedPrefix = `${this.namespace}:`;
    
    if (await this.isPreferencesAvailable()) {
      try {
        const { keys } = await this.preferencesModule.keys();
        return keys
          .filter(k => k.startsWith(namespacedPrefix))
          .map(k => k.slice(namespacedPrefix.length));
      } catch (error) {
        console.error('Error getting keys from native storage:', error);
        // Fall back to localStorage if native storage fails
        return this.getLocalStorageKeys();
      }
    } else {
      return this.getLocalStorageKeys();
    }
  }
  
  private getLocalStorageKeys(): string[] {
    const namespacedPrefix = `${this.namespace}:`;
    const result: string[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(namespacedPrefix)) {
          result.push(key.slice(namespacedPrefix.length));
        }
      }
    } catch (error) {
      console.error('Error getting keys from localStorage:', error);
    }
    
    return result;
  }
  
  // Storage type detection
  getImplementationType(): string {
    return Platform.isNative() 
      ? (this.isPreferencesLoaded ? 'Native Storage (Capacitor Preferences)' : 'Web Storage (localStorage, native fallback)') 
      : 'Web Storage (localStorage)';
  }
}

export default StorageManager;

// Migration utilities
export class StorageMigrationUtils {
  static async backupData(keys: string[]): Promise<Record<string, any>> {
    const backup: Record<string, any> = {};
    const storage = StorageManager.getInstance('backup');
    
    for (const key of keys) {
      const data = await storage.getItem(key);
      if (data !== null) {
        backup[key] = data;
      }
    }
    
    return backup;
  }
  
  static async restoreBackup(backup: Record<string, any>): Promise<void> {
    const storage = StorageManager.getInstance('backup');
    
    for (const [key, data] of Object.entries(backup)) {
      await storage.setItem(key, data);
    }
  }
  
  static async exportData(): Promise<string> {
    const storage = StorageManager.getInstance('export');
    const keys = await storage.keys();
    const data: Record<string, any> = {};
    
    for (const key of keys) {
      const value = await storage.getItem(key);
      if (value !== null) {
        data[key] = value;
      }
    }
    
    return JSON.stringify(data);
  }
  
  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      const storage = StorageManager.getInstance('import');
      
      for (const [key, value] of Object.entries(data)) {
        await storage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data: Invalid JSON format');
    }
  }
}
