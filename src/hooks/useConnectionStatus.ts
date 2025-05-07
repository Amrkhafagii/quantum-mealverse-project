
import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { toast } from '@/components/ui/use-toast';

export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  
  useEffect(() => {
    // Initial network status check
    const checkNetworkStatus = async () => {
      try {
        // First set from navigator.onLine as a fallback
        setIsOnline(navigator.onLine);
        
        // Then try to use Capacitor if available
        try {
          const status = await Network.getStatus();
          setIsOnline(status.connected);
          setConnectionType(status.connectionType);
        } catch (capacitorError) {
          console.log('Capacitor Network API not available, using browser API');
          // Continue with navigator.onLine
        }
      } catch (error) {
        console.error('Error checking network status:', error);
      }
    };
    
    checkNetworkStatus();
    
    // Set up browser online/offline event listeners as a fallback
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back online",
        description: "Your connection has been restored",
        variant: "default"
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You are offline",
        description: "Some features may be limited until connection is restored",
        variant: "destructive"
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set up listeners for network status changes with Capacitor if available
    let networkListener: any = null;
    
    const setupNetworkListener = async () => {
      try {
        networkListener = await Network.addListener('networkStatusChange', status => {
          setIsOnline(status.connected);
          setConnectionType(status.connectionType);
          
          if (!status.connected) {
            toast({
              title: "You are offline",
              description: "Some features may be limited until connection is restored",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Back online",
              description: `Connected via ${status.connectionType}`,
              variant: "default"
            });
          }
        });
      } catch (error) {
        console.error('Error setting up Capacitor network listener:', error);
        // Continue with browser events
      }
    };
    
    setupNetworkListener();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (networkListener) {
        networkListener.remove();
      }
    };
  }, []);
  
  return {
    isOnline,
    connectionType,
  };
};
