
import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { toast } from '@/components/ui/use-toast';

export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  
  useEffect(() => {
    // Initial network status check
    const checkNetworkStatus = async () => {
      try {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
        setConnectionType(status.connectionType);
      } catch (error) {
        console.error('Error checking network status:', error);
      }
    };
    
    checkNetworkStatus();
    
    // Set up listeners for network status changes
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
        console.error('Error setting up network listener:', error);
      }
    };
    
    setupNetworkListener();
    
    return () => {
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
