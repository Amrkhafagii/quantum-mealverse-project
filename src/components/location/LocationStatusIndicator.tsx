
import { useEffect, useState } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LocationStatusIndicatorProps {
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LocationStatusIndicator({ 
  showText = false, 
  className, 
  size = 'md' 
}: LocationStatusIndicatorProps) {
  const { isOnline, connectionType } = useConnectionStatus();
  const [showReconnecting, setShowReconnecting] = useState(false);
  
  // When connection is restored, briefly show a reconnected state
  useEffect(() => {
    if (isOnline) {
      setShowReconnecting(true);
      const timer = setTimeout(() => {
        setShowReconnecting(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);
  
  // Determine icon size based on size prop
  const iconSize = {
    sm: 14,
    md: 16,
    lg: 20
  }[size];
  
  // Determine indicator classnames based on connection state
  const indicatorClass = cn(
    "flex items-center gap-1.5 transition-colors duration-300",
    showReconnecting ? "text-green-500" : isOnline ? "text-green-500" : "text-amber-500",
    className
  );
  
  const connectionText = showReconnecting
    ? "Reconnected"
    : isOnline 
      ? connectionType === 'wifi' ? "Online (WiFi)" : "Online" 
      : "Offline";
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={indicatorClass}>
            {isOnline ? (
              <Wifi size={iconSize} className="animate-pulse" />
            ) : (
              <WifiOff size={iconSize} className="animate-pulse" />
            )}
            {showText && <span className="text-sm">{connectionText}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {connectionText}
            {isOnline && connectionType && ` (${connectionType})`}
          </p>
          {!isOnline && (
            <p className="text-xs text-amber-400">Some features may be limited</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default LocationStatusIndicator;
