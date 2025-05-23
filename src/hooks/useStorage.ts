
import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@/utils/platform';

/**
 * Hook for accessing and updating values in Capacitor Preferences storage
 */
export function useStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [storageType, setStorageType] = useState<string>('Preferences');

  // Load the value from storage when the component mounts
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setIsLoading(true);
        
        // Set storage type based on platform
        if (Platform.isNative()) {
          setStorageType('Native Preferences');
        } else {
          setStorageType('Browser LocalStorage');
        }
        
        const result = await Preferences.get({ key });
        
        if (result.value !== null) {
          // If the value is JSON, parse it
          try {
            const parsedValue = JSON.parse(result.value) as T;
            setValue(parsedValue);
          } catch {
            // If it's not valid JSON, use it as a string
            setValue(result.value as unknown as T);
          }
        }
        setError(null);
      } catch (err) {
        console.error(`Error loading value for key "${key}":`, err);
        setError(err instanceof Error ? err : new Error('Failed to load from storage'));
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  // Update the stored value
  const updateValue = async (newValue: T) => {
    try {
      setIsLoading(true);
      
      // Convert to string if it's not already
      const valueToStore = 
        typeof newValue === 'string' 
          ? newValue 
          : JSON.stringify(newValue);
      
      await Preferences.set({
        key,
        value: valueToStore,
      });
      
      setValue(newValue);
      setError(null);
      return true;
    } catch (err) {
      console.error(`Error saving value for key "${key}":`, err);
      setError(err instanceof Error ? err : new Error('Failed to save to storage'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the value from storage
  const removeValue = async () => {
    try {
      setIsLoading(true);
      await Preferences.remove({ key });
      setValue(initialValue);
      setError(null);
      return true;
    } catch (err) {
      console.error(`Error removing value for key "${key}":`, err);
      setError(err instanceof Error ? err : new Error('Failed to remove from storage'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    value,
    setValue: updateValue,
    removeValue,
    isLoading,
    error,
    storageType
  };
}

/**
 * Hook for migrating storage data (export/import functionality)
 */
export function useStorageMigration() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  /**
   * Export all storage data as a JSON string
   */
  const exportStorageData = useCallback(async (): Promise<string | null> => {
    try {
      setIsExporting(true);
      // Get all keys
      const { keys } = await Preferences.keys();
      
      if (!keys || keys.length === 0) {
        return JSON.stringify({ data: {}, timestamp: Date.now() });
      }
      
      // Get all values
      const data: Record<string, any> = {};
      for (const key of keys) {
        const result = await Preferences.get({ key });
        if (result.value !== null) {
          // Try to parse JSON values
          try {
            data[key] = JSON.parse(result.value);
          } catch {
            data[key] = result.value;
          }
        }
      }
      
      return JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0'
      });
    } catch (error) {
      console.error('Error exporting storage data:', error);
      return null;
    } finally {
      setIsExporting(false);
    }
  }, []);
  
  /**
   * Import storage data from a JSON string
   */
  const importStorageData = useCallback(async (jsonData: string): Promise<boolean> => {
    try {
      setIsImporting(true);
      
      // Parse the input JSON
      const parsedData = JSON.parse(jsonData);
      
      if (!parsedData.data || typeof parsedData.data !== 'object') {
        throw new Error('Invalid import data format');
      }
      
      // Clear existing data first
      await Preferences.clear();
      
      // Import all key-value pairs
      for (const [key, value] of Object.entries(parsedData.data)) {
        const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
        await Preferences.set({ key, value: valueToStore });
      }
      
      return true;
    } catch (error) {
      console.error('Error importing storage data:', error);
      return false;
    } finally {
      setIsImporting(false);
    }
  }, []);
  
  return {
    exportStorageData,
    importStorageData,
    isExporting,
    isImporting
  };
}
