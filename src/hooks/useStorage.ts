
import { useState, useEffect, useCallback } from 'react';
import { storageManager, StorageMigrationUtils } from '@/services/storage/StorageManager';

export function useStorage<T>(key: string, initialValue?: T) {
  const [value, setValue] = useState<T | undefined | null>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Load initial value from storage with retry mechanism
  const loadValue = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedValue = await storageManager.get<T>(key);
      
      if (storedValue !== null) {
        setValue(storedValue);
      } else if (initialValue !== undefined) {
        setValue(initialValue);
        // Also save the initial value to storage
        try {
          await storageManager.set(key, initialValue);
        } catch (saveError) {
          console.warn(`Failed to save initial value for key ${key}:`, saveError);
          // Continue even if saving fails - at least we have the value in memory
        }
      }
      
      setError(null);
    } catch (err) {
      console.error(`Error loading value for key ${key}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Retry logic for transient errors
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 500; // Exponential backoff
        console.log(`Retrying after ${delay}ms (attempt ${retryCount + 1}/${maxRetries})...`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
      } else {
        // Max retries reached, fall back to initial value
        console.warn(`Max retries reached for ${key}, falling back to initial value`);
        if (initialValue !== undefined) {
          setValue(initialValue);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, initialValue, retryCount]);

  // Load value initially and on retry attempts
  useEffect(() => {
    loadValue();
  }, [loadValue]);

  // Update storage when value changes with better error handling
  const updateValue = useCallback(
    async (newValue: T | ((prev: T | undefined | null) => T)): Promise<boolean> => {
      try {
        // If newValue is a function, call it with previous value
        const resolvedValue = newValue instanceof Function
          ? newValue(value)
          : newValue;
          
        // Update local state immediately
        setValue(resolvedValue);
        
        // Save to storage with retries
        let saveSuccess = false;
        let saveAttempts = 0;
        
        while (!saveSuccess && saveAttempts < 3) {
          try {
            await storageManager.set(key, resolvedValue);
            saveSuccess = true;
          } catch (err) {
            console.warn(`Error saving value (attempt ${saveAttempts + 1}/3):`, err);
            saveAttempts++;
            
            if (saveAttempts < 3) {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, saveAttempts)));
            } else {
              throw err; // Rethrow after max attempts
            }
          }
        }
        
        setError(null);
        return true;
      } catch (err) {
        console.error(`Error updating value for key ${key}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      }
    },
    [key, value]
  );

  // Remove value from storage with error handling and retries
  const removeValue = useCallback(async (): Promise<boolean> => {
    try {
      // Remove with retries
      let removeSuccess = false;
      let removeAttempts = 0;
      
      while (!removeSuccess && removeAttempts < 3) {
        try {
          await storageManager.remove(key);
          removeSuccess = true;
        } catch (err) {
          console.warn(`Error removing value (attempt ${removeAttempts + 1}/3):`, err);
          removeAttempts++;
          
          if (removeAttempts < 3) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, removeAttempts)));
          } else {
            throw err; // Rethrow after max attempts
          }
        }
      }
      
      setValue(undefined);
      setError(null);
      return true;
    } catch (err) {
      console.error(`Error removing value for key ${key}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  }, [key]);

  // Force reload the value from storage
  const reloadValue = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const storedValue = await storageManager.get<T>(key);
      
      if (storedValue !== null) {
        setValue(storedValue);
      } else {
        setValue(undefined);
      }
      
      setError(null);
      return true;
    } catch (err) {
      console.error(`Error reloading value for key ${key}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  return {
    value,
    setValue: updateValue,
    removeValue,
    isLoading,
    error,
    reloadValue,
    storageType: storageManager.getImplementationType()
  };
}

// Export storage migration utilities with better error handling
export const useStorageMigration = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const exportStorageData = async (): Promise<string | null> => {
    try {
      setIsExporting(true);
      setProgress(0);
      setError(null);
      
      // Get all keys to export
      const keys = await storageManager.keys();
      let exported = 0;
      const data: Record<string, any> = {};
      
      // Export data in chunks to avoid blocking UI
      for (const key of keys) {
        try {
          const value = await storageManager.get(key);
          if (value !== null) {
            data[key] = value;
          }
        } catch (keyError) {
          console.warn(`Error exporting key ${key}:`, keyError);
        }
        
        // Update progress
        exported++;
        setProgress(Math.floor((exported / keys.length) * 100));
      }
      
      setProgress(100);
      return JSON.stringify(data);
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
      setProgress(0);
      setError(null);
      
      const data = JSON.parse(jsonData);
      const keys = Object.keys(data);
      let imported = 0;
      
      // Import data in chunks
      for (const key of keys) {
        try {
          await storageManager.set(key, data[key]);
        } catch (keyError) {
          console.warn(`Error importing key ${key}:`, keyError);
        }
        
        // Update progress
        imported++;
        setProgress(Math.floor((imported / keys.length) * 100));
      }
      
      setProgress(100);
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
    error,
    progress
  };
};
