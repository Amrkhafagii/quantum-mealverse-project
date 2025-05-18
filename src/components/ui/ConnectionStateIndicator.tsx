
import React, { useEffect, useState } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStateIndicatorProps {
  showText?: boolean;
  className?: string;
}

export const ConnectionStateIndicator: React.FC<ConnectionStateIndicatorProps> = ({
  showText = false,
  className = '',
}) => {
  const { isOnline } = useConnectionStatus();
  const [isVisible, setIsVisible] = useState(false);
  
  // Only show the indicator after a short delay to avoid flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOnline) {
        setIsVisible(true);
      }
    }, 2000);
    
    if (isOnline) {
      setIsVisible(false);
    }
    
    return () => clearTimeout(timer);
  }, [isOnline]);
  
  if (isOnline && !showText) return null;
  
  return (
    <div className={`flex items-center ${className} ${isVisible || isOnline ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          {showText && <span className="ml-1 text-sm text-green-500">Online</span>}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          {showText && <span className="ml-1 text-sm text-red-500">Offline</span>}
        </>
      )}
    </div>
  );
};
