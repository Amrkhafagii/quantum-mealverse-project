
import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

/**
 * Hook for accessing and updating values in Capacitor Preferences storage
 */
export function useStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load the value from storage when the component mounts
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setIsLoading(true);
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
    error
  };
}
