
import { OfflineStorage } from './types';

// Dynamic import of Capacitor Preferences to avoid direct dependency in web environments
let Preferences: any = null;

// Try to load @capacitor/preferences only in environments where it's available
const loadPreferences = async () => {
  if (Preferences) return Preferences;
  
  try {
    // Using Function constructor to prevent bundlers from analyzing this at build time
    // This ensures the import only happens at runtime and not during build
    const importModule = new Function('return import("@capacitor/preferences")')();
    const module = await importModule;
    Preferences = module.Preferences;
    return Preferences;
  } catch (error) {
    console.error('Error loading Capacitor Preferences:', error);
    throw new Error('Capacitor Preferences is not available in this environment');
  }
};

/**
 * Native implementation of offline storage using Capacitor Preferences
 */
export class NativeStorage implements OfflineStorage {
  async get<T>(key: string): Promise<T | null> {
    try {
      const prefs = await loadPreferences();
      const { value } = await prefs.get({ key });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting item from native storage:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const prefs = await loadPreferences();
      await prefs.set({
        key,
        value: JSON.stringify(value),
      });
    } catch (error) {
      console.error('Error setting item in native storage:', error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const prefs = await loadPreferences();
      await prefs.remove({ key });
    } catch (error) {
      console.error('Error removing item from native storage:', error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      const prefs = await loadPreferences();
      const { keys } = await prefs.keys();
      return keys;
    } catch (error) {
      console.error('Error getting keys from native storage:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      const prefs = await loadPreferences();
      await prefs.clear();
    } catch (error) {
      console.error('Error clearing native storage:', error);
      throw error;
    }
  }
}
