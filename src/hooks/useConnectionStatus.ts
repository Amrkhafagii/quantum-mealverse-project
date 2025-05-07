
import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { toast } from '@/components/ui/use-toast';

export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  
  useEffect(() => {
    // Initial network status check
    const checkNetworkStatus = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
      setConnectionType(status.connectionType);
    };
    
    checkNetworkStatus();
    
    // Set up listeners for network status changes
    const networkListener = Network.addListener('networkStatusChange', status => {
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
    
    return () => {
      networkListener.remove();
    };
  }, []);
  
  return {
    isOnline,
    connectionType,
  };
};
