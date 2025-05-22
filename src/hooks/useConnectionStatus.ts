
import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
        setConnectionType(status.connectionType);
      } catch (error) {
        console.error('Error checking network status:', error);
        // Fallback to browser navigator.onLine if Capacitor network fails
        if (navigator && 'onLine' in navigator) {
          setIsOnline(navigator.onLine);
          setConnectionType(navigator.onLine ? 'unknown' : 'none');
        }
      }
    };

    // Initial check
    checkNetworkStatus();

    // Listen for changes
    const networkListener = Network.addListener('networkStatusChange', (status) => {
      setIsOnline(status.connected);
      setConnectionType(status.connectionType);
    });

    // Browser fallback
    const handleOnline = () => {
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
      networkListener.remove();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    connectionType
  };
}
