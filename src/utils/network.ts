
import { useEffect, useState } from 'react';

/**
 * Hook to monitor the connection status
 */
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { isOnline };
}

/**
 * Utility to create a fetch function that handles offline scenarios
 */
export const createOfflineFetch = (baseUrl: string, options?: RequestInit) => {
  return async (endpoint: string, fetchOptions?: RequestInit) => {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
          ...(fetchOptions?.headers || {})
        }
      });
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      // Add fallback mechanism for offline scenarios
      console.error('Network request failed:', error);
      throw error;
    }
  };
};
