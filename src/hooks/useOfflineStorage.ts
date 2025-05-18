
import { useState, useEffect, useCallback } from 'react';
import { Platform } from '@/utils/platform';

type StorageType = 'localStorage' | 'indexedDB' | 'native';

interface OfflineStorageOptions {
  storageType?: StorageType;
  syncWithServer?: boolean; 
  expiration?: number; // Time in milliseconds
}

export function useOfflineStorage<T>(
  key: string,
  initialValue: T,
  options: OfflineStorageOptions = {}
) {
  const {
    storageType = Platform.isNative() ? 'native' : 'localStorage',
    syncWithServer = false,
    expiration = 7 * 24 * 60 * 60 * 1000, // Default 7 days
  } = options;
  
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
  // Load data from storage on mount
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        setIsLoading(true);
        
        if (storageType === 'localStorage') {
          const storedValue = localStorage.getItem(key);
          if (storedValue) {
            const parsedData = JSON.parse(storedValue);
            
            // Check for expiration
            if (parsedData.timestamp && Date.now() - parsedData.timestamp < expiration) {
              setValue(parsedData.value);
              setLastSync(new Date(parsedData.timestamp));
            } else {
              // Data expired, remove it
              localStorage.removeItem(key);
              // Use initial value
              setValue(initialValue);
            }
          }
        } else if (storageType === 'indexedDB') {
          // This would be implemented with actual indexedDB methods
          console.log('IndexedDB storage not yet implemented');
        } else if (storageType === 'native') {
          // This would use Capacitor Storage API for native platforms
          try {
            const { Storage } = await import('@capacitor/storage');
            const { value: storedValue } = await Storage.get({ key });
            
            if (storedValue) {
              const parsedData = JSON.parse(storedValue);
              
              // Check for expiration
              if (parsedData.timestamp && Date.now() - parsedData.timestamp < expiration) {
                setValue(parsedData.value);
                setLastSync(new Date(parsedData.timestamp));
              } else {
                // Data expired, remove it
                await Storage.remove({ key });
                // Use initial value
                setValue(initialValue);
              }
            }
          } catch (err) {
            console.error('Error accessing native storage:', err);
            // Fall back to localStorage
            const storedValue = localStorage.getItem(key);
            if (storedValue) {
              const parsedData = JSON.parse(storedValue);
              if (parsedData.timestamp && Date.now() - parsedData.timestamp < expiration) {
                setValue(parsedData.value);
                setLastSync(new Date(parsedData.timestamp));
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading from storage:', err);
        setError(err instanceof Error ? err : new Error('Unknown storage error'));
        
        // Try to recover
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
          try {
            const parsedData = JSON.parse(storedValue);
            setValue(parsedData.value);
          } catch (parseErr) {
            // If parsing fails, use initial value
            setValue(initialValue);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFromStorage();
  }, [key, initialValue, storageType, expiration]);
  
  // Save data to storage
  const saveValue = useCallback(async (newValue: T) => {
    setValue(newValue);
    
    const dataWithTimestamp = {
      value: newValue,
      timestamp: Date.now(),
    };
    
    try {
      if (storageType === 'localStorage') {
        localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
        setLastSync(new Date());
      } else if (storageType === 'indexedDB') {
        // This would be implemented with actual indexedDB methods
        console.log('IndexedDB storage not yet implemented');
      } else if (storageType === 'native') {
        try {
          const { Storage } = await import('@capacitor/storage');
          await Storage.set({
            key,
            value: JSON.stringify(dataWithTimestamp),
          });
          setLastSync(new Date());
        } catch (err) {
          console.error('Error saving to native storage:', err);
          // Fall back to localStorage
          localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
          setLastSync(new Date());
        }
      }
      
      // If sync with server is enabled, we would implement that here
      if (syncWithServer) {
        // Example implementation - would be replaced with actual API call
        console.log(`Would sync ${key} with server if implemented`);
      }
    } catch (err) {
      console.error('Error saving to storage:', err);
      setError(err instanceof Error ? err : new Error('Unknown storage error'));
      
      // Try to fall back to localStorage
      try {
        localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
      } catch (fallbackErr) {
        console.error('Storage fallback failed:', fallbackErr);
      }
    }
  }, [key, storageType, syncWithServer]);
  
  // Clear the stored data
  const clearValue = useCallback(async () => {
    setValue(initialValue);
    setLastSync(null);
    
    try {
      if (storageType === 'localStorage') {
        localStorage.removeItem(key);
      } else if (storageType === 'indexedDB') {
        // This would be implemented with actual indexedDB methods
        console.log('IndexedDB delete not yet implemented');
      } else if (storageType === 'native') {
        try {
          const { Storage } = await import('@capacitor/storage');
          await Storage.remove({ key });
        } catch (err) {
          console.error('Error clearing native storage:', err);
          // Fall back to localStorage
          localStorage.removeItem(key);
        }
      }
    } catch (err) {
      console.error('Error clearing storage:', err);
      setError(err instanceof Error ? err : new Error('Unknown storage error'));
      
      // Try to fall back to localStorage
      try {
        localStorage.removeItem(key);
      } catch (fallbackErr) {
        console.error('Storage fallback failed:', fallbackErr);
      }
    }
  }, [key, initialValue, storageType]);
  
  return {
    value,
    setValue: saveValue,
    clearValue,
    isLoading,
    error,
    lastSync,
  };
}
