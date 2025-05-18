
import { useState, useEffect } from 'react';

interface ConnectionStatus {
  isOnline: boolean;
  wasOffline: boolean;
  connectionType?: string;
  resetWasOffline: () => void;
}

export function useConnectionStatus(): ConnectionStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      if (!isOnline) {
        setWasOffline(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Get connection type if available (for mobile)
    const getConnectionType = async () => {
      try {
        if ('connection' in navigator && navigator.connection) {
          // @ts-ignore - TypeScript doesn't know about Navigator.connection
          const type = navigator.connection.effectiveType || 'unknown';
          setConnectionType(type);
          
          // @ts-ignore - TypeScript doesn't know about Navigator.connection
          navigator.connection.addEventListener('change', () => {
            // @ts-ignore - TypeScript doesn't know about Navigator.connection
            setConnectionType(navigator.connection.effectiveType || 'unknown');
          });
        } else if (!window.navigator.onLine) {
          setConnectionType('none');
        } else {
          try {
            // Try to determine connection quality by measuring fetch time
            const start = Date.now();
            const response = await fetch('/ping', { method: 'HEAD' });
            const end = Date.now();
            
            if (response.ok) {
              const latency = end - start;
              if (latency < 100) {
                setConnectionType('4g');
              } else if (latency < 300) {
                setConnectionType('3g');
              } else {
                setConnectionType('2g');
              }
            }
          } catch (e) {
            // If fetch fails, we're probably offline
            setConnectionType('none');
          }
        }
      } catch (e) {
        console.error('Error getting connection type', e);
      }
    };

    getConnectionType();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      try {
        if ('connection' in navigator && navigator.connection) {
          // @ts-ignore - TypeScript doesn't know about Navigator.connection
          navigator.connection.removeEventListener('change', () => {});
        }
      } catch (e) {
        // Ignore errors when removing event listener
      }
    };
  }, [isOnline]);

  const resetWasOffline = () => {
    setWasOffline(false);
  };

  return { 
    isOnline, 
    wasOffline, 
    connectionType, 
    resetWasOffline 
  };
}
