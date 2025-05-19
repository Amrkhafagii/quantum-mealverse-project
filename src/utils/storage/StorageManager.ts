
// Create the storage manager file that was missing
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@/utils/platform';

/**
 * A storage manager class that provides a unified interface for storing data
 * across different platforms and storage types
 */
export class StorageManager {
  private static instances: Record<string, StorageManager> = {};
  private namespace: string;
  
  private constructor(namespace: string) {
    this.namespace = namespace;
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
      await Preferences.set({
        key: namespacedKey,
        value: stringifiedValue
      });
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
      const { value } = await Preferences.get({ key: namespacedKey });
      if (!value) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
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
      await Preferences.remove({ key: namespacedKey });
    } else {
      localStorage.removeItem(namespacedKey);
    }
  }
  
  /**
   * Clear all items in this namespace
   */
  public async clear(): Promise<void> {
    if (Platform.isNative()) {
      const { keys } = await Preferences.keys();
      const namespacedKeys = keys.filter(k => k.startsWith(`${this.namespace}:`));
      
      for (const key of namespacedKeys) {
        await Preferences.remove({ key });
      }
    } else {
      // For localStorage, we iterate through all keys and remove those in our namespace
      const namespacedPrefix = `${this.namespace}:`;
      
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(namespacedPrefix)) {
          localStorage.removeItem(key);
        }
      }
    }
  }
  
  /**
   * Get all keys in this namespace
   */
  public async keys(): Promise<string[]> {
    const namespacedPrefix = `${this.namespace}:`;
    
    if (Platform.isNative()) {
      const { keys } = await Preferences.keys();
      return keys
        .filter(k => k.startsWith(namespacedPrefix))
        .map(k => k.slice(namespacedPrefix.length));
    } else {
      const result: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(namespacedPrefix)) {
          result.push(key.slice(namespacedPrefix.length));
        }
      }
      
      return result;
    }
  }
}

export default StorageManager;
