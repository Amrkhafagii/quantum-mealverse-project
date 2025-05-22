
// Create the storage manager file that was missing
import { Platform } from '@/utils/platform';

/**
 * A storage manager class that provides a unified interface for storing data
 * across different platforms and storage types
 */
export class StorageManager {
  private static instances: Record<string, StorageManager> = {};
  private namespace: string;
  private preferencesModule: any = null;
  
  private constructor(namespace: string) {
    this.namespace = namespace;
    // Attempt to load Preferences module if on native platform
    if (Platform.isNative()) {
      this.loadPreferencesModule().catch(err => 
        console.warn('Could not load Preferences module:', err)
      );
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
   * Load Preferences module dynamically to avoid build-time issues
   */
  private async loadPreferencesModule(): Promise<any> {
    if (this.preferencesModule) return this.preferencesModule;
    
    try {
      // Using Function constructor to prevent bundlers from analyzing this at build time
      const importModule = new Function('return import("@capacitor/preferences")')();
      const module = await importModule;
      this.preferencesModule = module.Preferences;
      return this.preferencesModule;
    } catch (error) {
      console.error('Error loading Capacitor Preferences:', error);
      throw error;
    }
  }
  
  /**
   * Generate a key with namespace
   */
  private getNamespacedKey(key: string): string {
    return `${this.namespace}:${key}`;
  }
  
  /**
   * Set an item in storage
   */
  public async setItem<T>(key: string, value: T): Promise<void> {
    const namespacedKey = this.getNamespacedKey(key);
    const stringifiedValue = JSON.stringify(value);
    
    if (Platform.isNative()) {
      try {
        const prefs = await this.loadPreferencesModule();
        await prefs.set({
          key: namespacedKey,
          value: stringifiedValue
        });
      } catch (error) {
        console.error('Error saving to Preferences:', error);
        // Fall back to localStorage if native storage fails
        localStorage.setItem(namespacedKey, stringifiedValue);
      }
    } else {
      try {
        localStorage.setItem(namespacedKey, stringifiedValue);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        throw error;
      }
    }
  }
  
  /**
   * Get an item from storage
   */
  public async getItem<T>(key: string): Promise<T | null> {
    const namespacedKey = this.getNamespacedKey(key);
    
    if (Platform.isNative()) {
      try {
        const prefs = await this.loadPreferencesModule();
        const { value } = await prefs.get({ key: namespacedKey });
        if (!value) return null;
        
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      } catch (error) {
        console.error('Error getting from Preferences:', error);
        // Fall back to localStorage if native storage fails
        const value = localStorage.getItem(namespacedKey);
        if (!value) return null;
        
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      }
    } else {
      const value = localStorage.getItem(namespacedKey);
      if (!value) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    }
  }
  
  /**
   * Remove an item from storage
   */
  public async removeItem(key: string): Promise<void> {
    const namespacedKey = this.getNamespacedKey(key);
    
    if (Platform.isNative()) {
      try {
        const prefs = await this.loadPreferencesModule();
        await prefs.remove({ key: namespacedKey });
      } catch (error) {
        console.error('Error removing from Preferences:', error);
        // Fall back to localStorage if native storage fails
        localStorage.removeItem(namespacedKey);
      }
    } else {
      localStorage.removeItem(namespacedKey);
    }
  }
  
  /**
   * Clear all items in this namespace
   */
  public async clear(): Promise<void> {
    if (Platform.isNative()) {
      try {
        const prefs = await this.loadPreferencesModule();
        const { keys } = await prefs.keys();
        const namespacedKeys = keys.filter(k => k.startsWith(`${this.namespace}:`));
        
        for (const key of namespacedKeys) {
          await prefs.remove({ key });
        }
      } catch (error) {
        console.error('Error clearing Preferences:', error);
        // Fall back to localStorage clearing if native storage fails
        this.clearLocalStorage();
      }
    } else {
      this.clearLocalStorage();
    }
  }
  
  private clearLocalStorage(): void {
    // For localStorage, we iterate through all keys and remove those in our namespace
    const namespacedPrefix = `${this.namespace}:`;
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(namespacedPrefix)) {
        localStorage.removeItem(key);
      }
    }
  }
  
  /**
   * Get all keys in this namespace
   */
  public async keys(): Promise<string[]> {
    const namespacedPrefix = `${this.namespace}:`;
    
    if (Platform.isNative()) {
      try {
        const prefs = await this.loadPreferencesModule();
        const { keys } = await prefs.keys();
        return keys
          .filter(k => k.startsWith(namespacedPrefix))
          .map(k => k.slice(namespacedPrefix.length));
      } catch (error) {
        console.error('Error getting keys from Preferences:', error);
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
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(namespacedPrefix)) {
        result.push(key.slice(namespacedPrefix.length));
      }
    }
    
    return result;
  }
  
  // Storage type detection
  getImplementationType(): string {
    return Platform.isNative() ? 'Native Storage (Capacitor Preferences)' : 'Web Storage (localStorage)';
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
