
import { useEffect, useState, useRef } from 'react';
import { Platform } from '@/utils/platform';

export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const networkRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.isWeb) {
      // Web implementation
      const handleOnline = () => {
        setIsOnline(true);
        setWasOffline(prev => {
          if (prev) return true; // Keep wasOffline true if it was true before
          return false;
        });
      };
      
      const handleOffline = () => {
        setIsOnline(false);
        setWasOffline(true);
      };
      
      // Initialize state
      setIsOnline(navigator.onLine);
      
      // Add event listeners
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // Native implementation with Capacitor
      try {
        const initNetwork = async () => {
          try {
            const { Network } = await import('@capacitor/network');
            
            const handler = Network.addListener('networkStatusChange', (status) => {
              setIsOnline(status.connected);
              if (!status.connected) {
                setWasOffline(true);
              }
            });
            
            const status = await Network.getStatus();
            setIsOnline(status.connected);
            
            networkRef.current = handler;
          } catch (err) {
            console.error('Error initializing network status:', err);
          }
        };
        
        initNetwork();
        
        return () => {
          if (networkRef.current) {
            networkRef.current.remove();
          }
        };
      } catch (err) {
        console.error('Error loading Capacitor Network:', err);
        // Fallback to online
        setIsOnline(true);
      }
    }
  }, []);

  // Reset wasOffline flag
  const resetWasOffline = () => {
    setWasOffline(false);
  };

  return { isOnline, wasOffline, resetWasOffline };
};
