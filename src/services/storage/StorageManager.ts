
import { Platform } from '@/utils/platform';
import { WebStorage } from '@/utils/offlineStorage/webStorage';
import { NativeStorage } from '@/utils/offlineStorage/nativeStorage';
import { OfflineStorage } from '@/utils/offlineStorage/types';

export class StorageManager {
  private static instance: StorageManager;
  private storageImplementation: OfflineStorage;
  private migrationVersion: number = 1;
  
  private constructor() {
    this.storageImplementation = Platform.isNative() 
      ? new NativeStorage() 
      : new WebStorage();
    
    // Initialize migrations
    this.checkMigrations();
  }
  
  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }
  
  private async checkMigrations(): Promise<void> {
    try {
      const storedVersion = await this.getStorageVersion();
      if (storedVersion < this.migrationVersion) {
        await this.migrateStorage(storedVersion, this.migrationVersion);
        await this.setStorageVersion(this.migrationVersion);
      }
    } catch (error) {
      console.error('Error checking migrations:', error);
      // Set default version if not present
      await this.setStorageVersion(this.migrationVersion);
    }
  }
  
  private async getStorageVersion(): Promise<number> {
    const version = await this.storageImplementation.get<number>('storage_version');
    return version || 0;
  }
  
  private async setStorageVersion(version: number): Promise<void> {
    await this.storageImplementation.set('storage_version', version);
  }
  
  private async migrateStorage(fromVersion: number, toVersion: number): Promise<void> {
    console.log(`Migrating storage from version ${fromVersion} to ${toVersion}`);
    
    // Implement migration steps based on version changes
    // Example:
    /*
    if (fromVersion < 2) {
      // Migrate from v1 to v2
      const oldData = await this.storageImplementation.get('old_key');
      if (oldData) {
        // Transform data
        const newData = transformDataV1toV2(oldData);
        // Save with new structure
        await this.storageImplementation.set('new_key', newData);
        // Remove old data if needed
        await this.storageImplementation.remove('old_key');
      }
    }
    */
  }
  
  async get<T>(key: string): Promise<T | null> {
    return this.storageImplementation.get<T>(key);
  }
  
  async set<T>(key: string, value: T): Promise<void> {
    await this.storageImplementation.set<T>(key, value);
  }
  
  async remove(key: string): Promise<void> {
    await this.storageImplementation.remove(key);
  }
  
  async keys(): Promise<string[]> {
    return this.storageImplementation.keys();
  }
  
  async clear(): Promise<void> {
    await this.storageImplementation.clear();
  }
  
  // Storage type detection
  isUsingNativeStorage(): boolean {
    return this.storageImplementation instanceof NativeStorage;
  }
  
  isUsingWebStorage(): boolean {
    return this.storageImplementation instanceof WebStorage;
  }
  
  getImplementationType(): string {
    return this.isUsingNativeStorage() ? 'Native Storage (Capacitor Preferences)' : 'Web Storage (IndexedDB/localStorage)';
  }
}

// Export a singleton instance
export const storageManager = StorageManager.getInstance();

// Migration utilities
export class StorageMigrationUtils {
  static async backupData(keys: string[]): Promise<Record<string, any>> {
    const backup: Record<string, any> = {};
    const storage = StorageManager.getInstance();
    
    for (const key of keys) {
      const data = await storage.get(key);
      if (data !== null) {
        backup[key] = data;
      }
    }
    
    return backup;
  }
  
  static async restoreBackup(backup: Record<string, any>): Promise<void> {
    const storage = StorageManager.getInstance();
    
    for (const [key, data] of Object.entries(backup)) {
      await storage.set(key, data);
    }
  }
  
  static async exportData(): Promise<string> {
    const storage = StorageManager.getInstance();
    const keys = await storage.keys();
    const data: Record<string, any> = {};
    
    for (const key of keys) {
      const value = await storage.get(key);
      if (value !== null) {
        data[key] = value;
      }
    }
    
    return JSON.stringify(data);
  }
  
  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      const storage = StorageManager.getInstance();
      
      for (const [key, value] of Object.entries(data)) {
        await storage.set(key, value);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data: Invalid JSON format');
    }
  }
}
