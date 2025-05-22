
import { useState, useCallback, useEffect } from 'react';
import offlineStorage from '../utils/offlineStorage/factory';

interface UseOfflineStorageOptions<T> {
  key: string;
  initialValue?: T;
  serialize?: (value: T) => any;
  deserialize?: (value: any) => T;
}

export function useOfflineStorage<T>({
  key,
  initialValue,
  serialize = (val: T) => val,
  deserialize = (val: any) => val as T,
}: UseOfflineStorageOptions<T>) {
  const [value, setValue] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value from storage
  useEffect(() => {
    const loadValue = async () => {
      try {
        setIsLoading(true);
        const storedValue = await offlineStorage.get<T>(key);
        
        if (storedValue !== null) {
          setValue(deserialize(storedValue));
        } else if (initialValue !== undefined) {
          setValue(initialValue);
          // Also save the initial value to storage
          await offlineStorage.set(key, serialize(initialValue));
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
  }, [key, initialValue, serialize, deserialize]);

  // Update storage when value changes
  const updateValue = useCallback(
    async (newValue: T | ((prev: T | undefined) => T)) => {
      try {
        // If newValue is a function, call it with previous value
        const resolvedValue = newValue instanceof Function
          ? newValue(value)
          : newValue;
          
        // Update local state immediately
        setValue(resolvedValue);
        
        // Save to storage
        await offlineStorage.set(key, serialize(resolvedValue));
        
        setError(null);
        return true;
      } catch (err) {
        console.error(`Error updating value for key ${key}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      }
    },
    [key, value, serialize]
  );

  // Remove value from storage
  const removeValue = useCallback(async () => {
    try {
      await offlineStorage.remove(key);
      setValue(undefined);
      setError(null);
      return true;
    } catch (err) {
      console.error(`Error removing value for key ${key}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  }, [key]);

  return {
    value,
    setValue: updateValue,
    removeValue,
    isLoading,
    error,
  };
}
