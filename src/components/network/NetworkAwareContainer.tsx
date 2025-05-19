
import React, { useEffect, useState } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

export interface NetworkAwareContainerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  criticalOperation?: boolean;
  onRetry?: () => void;
  showOfflineMessage?: boolean;
  className?: string;
}

export const NetworkAwareContainer: React.FC<NetworkAwareContainerProps> = ({
  children,
  fallback,
  criticalOperation = false,
  onRetry,
  showOfflineMessage = true,
  className = ''
}) => {
  const { isOnline, connectionType, wasOffline, resetWasOffline } = useConnectionStatus();
  const [showReconnectedMessage, setShowReconnectedMessage] = useState(false);
  const { theme } = useTheme();
  
  // If we just came back online, show the reconnected message
  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowReconnectedMessage(true);
      const timer = setTimeout(() => {
        setShowReconnectedMessage(false);
        resetWasOffline();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline, resetWasOffline]);
  
  // For critical operations, always show offline state
  if (criticalOperation && !isOnline) {
    return (
      <div className={className}>
        {fallback || (
          <Card className="p-6 flex flex-col items-center justify-center text-center">
            <WifiOff className="h-10 w-10 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Internet Connection</h3>
            <p className="text-gray-500 mb-4">You need to be online to use this feature.</p>
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </Card>
        )}
      </div>
    );
  }
  
  // For regular content, render children with conditional overlay
  return (
    <div className={`relative ${className}`}>
      {children}
      
      {!isOnline && showOfflineMessage && (
        <div className={`
          fixed bottom-0 left-0 right-0 z-50 
          p-2 bg-${theme === 'dark' ? 'red-950/90' : 'red-50/90'} 
          border-t border-${theme === 'dark' ? 'red-800' : 'red-200'}
          backdrop-blur-sm
          flex items-center justify-center gap-2
          text-${theme === 'dark' ? 'red-200' : 'red-800'}
        `}>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
        </div>
      )}
      
      {showReconnectedMessage && (
        <div className={`
          fixed bottom-0 left-0 right-0 z-50 
          p-2 bg-${theme === 'dark' ? 'green-950/90' : 'green-50/90'} 
          border-t border-${theme === 'dark' ? 'green-800' : 'green-200'}
          backdrop-blur-sm
          flex items-center justify-center gap-2
          text-${theme === 'dark' ? 'green-200' : 'green-800'}
        `}>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">You're back online!</span>
        </div>
      )}
    </div>
  );
};

export default NetworkAwareContainer;
