
import { useState, useEffect } from 'react';
import { storageManager, StorageMigrationUtils } from '@/services/storage/StorageManager';

export function useStorage<T>(key: string, initialValue?: T) {
  const [value, setValue] = useState<T | undefined | null>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value from storage
  useEffect(() => {
    const loadValue = async () => {
      try {
        setIsLoading(true);
        const storedValue = await storageManager.get<T>(key);
        
        if (storedValue !== null) {
          setValue(storedValue);
        } else if (initialValue !== undefined) {
          setValue(initialValue);
          // Also save the initial value to storage
          await storageManager.set(key, initialValue);
        }
        
        setError(null);
      } catch (err) {
        console.error(`Error loading value for key ${key}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Fall back to initial value if loading fails
        if (initialValue !== undefined) {
          setValue(initialValue);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key, initialValue]);

  // Update storage when value changes
  const updateValue = async (newValue: T | ((prev: T | undefined | null) => T)): Promise<boolean> => {
    try {
      // If newValue is a function, call it with previous value
      const resolvedValue = newValue instanceof Function
        ? newValue(value)
        : newValue;
        
      // Update local state immediately
      setValue(resolvedValue);
      
      // Save to storage
      await storageManager.set(key, resolvedValue);
      
      setError(null);
      return true;
    } catch (err) {
      console.error(`Error updating value for key ${key}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  // Remove value from storage
  const removeValue = async (): Promise<boolean> => {
    try {
      await storageManager.remove(key);
      setValue(undefined);
      setError(null);
      return true;
    } catch (err) {
      console.error(`Error removing value for key ${key}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  return {
    value,
    setValue: updateValue,
    removeValue,
    isLoading,
    error,
    storageType: storageManager.getImplementationType()
  };
}

// Export storage migration utilities
export const useStorageMigration = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportStorageData = async (): Promise<string | null> => {
    try {
      setIsExporting(true);
      const jsonData = await StorageMigrationUtils.exportData();
      setError(null);
      return jsonData;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const importStorageData = async (jsonData: string): Promise<boolean> => {
    try {
      setIsImporting(true);
      await StorageMigrationUtils.importData(jsonData);
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    exportStorageData,
    importStorageData,
    isExporting,
    isImporting,
    error
  };
};
