
import { OfflineStorage } from './types';
import { Platform } from '@/utils/platform';

// Dynamic import of Capacitor Preferences to avoid direct dependency in web environments
let Preferences: any = null;

// Try to load @capacitor/preferences only in environments where it's available
const loadPreferences = async () => {
  if (Preferences) return Preferences;
  
  // Only attempt to load on native platforms
  if (!Platform.isNative()) {
    throw new Error('Capacitor Preferences is not available in web environment');
  }
  
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
 * Falls back to localStorage in web environment
 */
export class NativeStorage implements OfflineStorage {
  async get<T>(key: string): Promise<T | null> {
    try {
      // Check if we're in a native environment first
      if (!Platform.isNative()) {
        // Fallback to localStorage for web
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }

      const prefs = await loadPreferences();
      const { value } = await prefs.get({ key });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting item from native storage:', error);
      // Fallback to localStorage
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
      // Check if we're in a native environment first
      if (!Platform.isNative()) {
        // Fallback to localStorage for web
        localStorage.setItem(key, JSON.stringify(value));
        return;
      }

      const prefs = await loadPreferences();
      await prefs.set({
        key,
        value: JSON.stringify(value),
      });
    } catch (error) {
      console.error('Error setting item in native storage:', error);
      // Fallback to localStorage
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (fallbackError) {
        console.error('Error using localStorage fallback:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async remove(key: string): Promise<void> {
    try {
      // Check if we're in a native environment first
      if (!Platform.isNative()) {
        // Fallback to localStorage for web
        localStorage.removeItem(key);
        return;
      }

      const prefs = await loadPreferences();
      await prefs.remove({ key });
    } catch (error) {
      console.error('Error removing item from native storage:', error);
      // Fallback to localStorage
      try {
        localStorage.removeItem(key);
      } catch (fallbackError) {
        console.error('Error using localStorage fallback:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async keys(): Promise<string[]> {
    try {
      // Check if we're in a native environment first
      if (!Platform.isNative()) {
        // Fallback to localStorage for web
        return Object.keys(localStorage);
      }

      const prefs = await loadPreferences();
      const { keys } = await prefs.keys();
      return keys;
    } catch (error) {
      console.error('Error getting keys from native storage:', error);
      // Fallback to localStorage
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
      // Check if we're in a native environment first
      if (!Platform.isNative()) {
        // Fallback to localStorage for web
        localStorage.clear();
        return;
      }

      const prefs = await loadPreferences();
      await prefs.clear();
    } catch (error) {
      console.error('Error clearing native storage:', error);
      // Fallback to localStorage
      try {
        localStorage.clear();
      } catch (fallbackError) {
        console.error('Error using localStorage fallback:', fallbackError);
        throw fallbackError;
      }
    }
  }
}
