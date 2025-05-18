
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { toast } from '@/components/ui/use-toast';
import { WifiOff, Wifi, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/utils/hapticFeedback';

interface NetworkStatusContextType {
  isOnline: boolean;
  connectionType: string | null;
  quality: 'high' | 'medium' | 'low' | 'unknown';
  isLowQuality: boolean;
  hasInternet: boolean;
  wasOffline: boolean;
  resetWasOffline: () => void;
}

const NetworkStatusContext = createContext<NetworkStatusContextType>({
  isOnline: true,
  connectionType: null,
  quality: 'unknown',
  isLowQuality: false,
  hasInternet: true,
  wasOffline: false,
  resetWasOffline: () => {},
});

export const useNetworkStatus = () => useContext(NetworkStatusContext);

interface NetworkStatusProviderProps {
  children: React.ReactNode;
  showToasts?: boolean;
}

export const NetworkStatusProvider: React.FC<NetworkStatusProviderProps> = ({
  children,
  showToasts = true,
}) => {
  const { 
    isOnline, 
    connectionType, 
    wasOffline,
    resetWasOffline
  } = useConnectionStatus();
  const { quality, isLowQuality } = useNetworkQuality();
  
  // Combine connection info
  const hasInternet = isOnline;
  
  // Show visual indicator when offline
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);
  
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineIndicator(true);
      
      if (showToasts) {
        hapticFeedback.error();
        toast({
          title: "You're offline",
          description: "Some features may be limited",
          duration: 4000,
        });
      }
    } else if (wasOffline) {
      // Show online indicator briefly when coming back online
      setShowOfflineIndicator(false);
      
      if (showToasts) {
        hapticFeedback.success();
        toast({
          title: "You're back online",
          description: connectionType 
            ? `Connected via ${connectionType}` 
            : "Connection restored",
          duration: 3000,
        });
      }
      
      resetWasOffline();
    }
  }, [isOnline, wasOffline, connectionType, showToasts, resetWasOffline]);
  
  return (
    <NetworkStatusContext.Provider
      value={{
        isOnline,
        connectionType,
        quality,
        isLowQuality,
        hasInternet,
        wasOffline,
        resetWasOffline
      }}
    >
      {children}
      
      {/* Floating offline indicator */}
      {showOfflineIndicator && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 
                      animate-in fade-in slide-in-from-bottom-4">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-destructive text-destructive-foreground shadow-lg"
          )}>
            <WifiOff size={16} />
            <span className="text-sm font-medium">Offline Mode</span>
          </div>
        </div>
      )}
      
      {/* Low quality network indicator */}
      {isOnline && isLowQuality && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full",
            "bg-yellow-500/90 text-white shadow-lg text-xs"
          )}>
            <Activity size={12} />
            <span>Slow Network</span>
          </div>
        </div>
      )}
    </NetworkStatusContext.Provider>
  );
};
