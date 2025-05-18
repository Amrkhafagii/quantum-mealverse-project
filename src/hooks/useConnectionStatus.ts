
import { useState, useEffect, useCallback } from 'react';
import { Network } from '@capacitor/network';
import { Platform } from '@/utils/platform';

interface ConnectionStatusResult {
  isOnline: boolean;
  connectionType: string | null;
  wasOffline: boolean;
  resetWasOffline: () => void;
}

export function useConnectionStatus(): ConnectionStatusResult {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  
  const resetWasOffline = useCallback(() => {
    setWasOffline(false);
  }, []);

  useEffect(() => {
    let networkListener: any;
    
    // Initialize connection status
    const getNetworkStatus = async () => {
      try {
        if (Platform.isNative()) {
          // For native (iOS/Android) using Capacitor Network plugin
          const status = await Network.getStatus();
          setIsOnline(status.connected);
          setConnectionType(status.connectionType);
          
          // Set up Capacitor network status listener
          networkListener = Network.addListener('networkStatusChange', (status) => {
            const wasOfflineBefore = !isOnline;
            setIsOnline(status.connected);
            setConnectionType(status.connectionType);
            
            if (wasOfflineBefore && status.connected) {
              setWasOffline(true);
            }
          });
        } else {
          // For web browsers
          setIsOnline(navigator.onLine);
          
          // Try to detect connection type using Network Information API
          if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            setConnectionType(connection?.effectiveType || connection?.type || null);
            
            // Listen for changes to connection type
            connection?.addEventListener('change', () => {
              setConnectionType(connection?.effectiveType || connection?.type || null);
            });
          }
          
          // Listen for online/offline events
          const handleOnline = () => {
            if (!isOnline) {
              setWasOffline(true);
            }
            setIsOnline(true);
          };
          
          const handleOffline = () => {
            setIsOnline(false);
          };
          
          window.addEventListener('online', handleOnline);
          window.addEventListener('offline', handleOffline);
          
          return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            
            if ('connection' in navigator) {
              const connection = (navigator as any).connection;
              connection?.removeEventListener('change', () => {});
            }
          };
        }
      } catch (error) {
        console.error("Error getting network status:", error);
        // Fallback to browser navigator.onLine
        setIsOnline(navigator.onLine);
      }
    };
    
    getNetworkStatus();
    
    return () => {
      if (networkListener) {
        networkListener.remove();
      }
    };
  }, [isOnline]);

  return { isOnline, connectionType, wasOffline, resetWasOffline };
}
