
import { useState, useEffect, useCallback } from 'react';
import { Network } from '@capacitor/network';

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  const resetWasOffline = useCallback(() => {
    setWasOffline(false);
  }, []);

  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const status = await Network.getStatus();
        
        // If we were offline before and now we're online, set wasOffline flag
        if (!isOnline && status.connected) {
          setWasOffline(true);
        }
        
        setIsOnline(status.connected);
        setConnectionType(status.connectionType);
      } catch (error) {
        console.error('Error checking network status:', error);
        // Fallback to browser navigator.onLine if Capacitor network fails
        if (navigator && 'onLine' in navigator) {
          // If we were offline before and now we're online, set wasOffline flag
          if (!isOnline && navigator.onLine) {
            setWasOffline(true);
          }
          
          setIsOnline(navigator.onLine);
          setConnectionType(navigator.onLine ? 'unknown' : 'none');
        }
      }
    };

    // Initial check
    checkNetworkStatus();

    // Listen for changes
    const networkListener = Network.addListener('networkStatusChange', (status) => {
      // If we were offline before and now we're online, set wasOffline flag
      if (!isOnline && status.connected) {
        setWasOffline(true);
      }
      
      setIsOnline(status.connected);
      setConnectionType(status.connectionType);
    });

    // Browser fallback
    const handleOnline = () => {
      setWasOffline(true);
      setIsOnline(true);
      setConnectionType('unknown'); // Browser API doesn't provide the type
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionType('none');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      // Using void to handle the promise without awaiting it
      void networkListener.remove().catch(console.error);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return {
    isOnline,
    connectionType,
    wasOffline,
    resetWasOffline
  };
}
