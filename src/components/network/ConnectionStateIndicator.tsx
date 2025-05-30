
import React, { useEffect, useState } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { Wifi, WifiOff, WifiLow, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ConnectionStateIndicatorProps {
  showText?: boolean;
  showQuality?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'icon' | 'full';
}

export function ConnectionStateIndicator({ 
  showText = false, 
  showQuality = false,
  className = '', 
  size = 'md',
  variant = 'icon'
}: ConnectionStateIndicatorProps) {
  const { isOnline, connectionType, wasOffline, resetWasOffline } = useConnectionStatus();
  const { quality, isLowQuality, hasTransitioned } = useNetworkQuality();
  const [showReconnecting, setShowReconnecting] = useState(false);
  
  // When connection is restored, briefly show a reconnected state
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnecting(true);
      const timer = setTimeout(() => {
        setShowReconnecting(false);
        resetWasOffline();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, resetWasOffline]);
  
  // Determine icon size based on size prop
  const iconSize = {
    sm: 14,
    md: 16,
    lg: 20
  }[size];
  
  // Determine indicator color based on connection state
  const getColor = () => {
    if (!isOnline) return "text-red-500";
    if (showReconnecting) return "text-green-500";
    if (isLowQuality) return "text-amber-500";
    return "text-green-500";
  };
  
  // Determine icon based on connection state
  const getIcon = () => {
    if (!isOnline) return <WifiOff size={iconSize} />;
    if (isLowQuality) return <WifiLow size={iconSize} />;
    return <Wifi size={iconSize} />;
  };
  
  // Generate status text
  const getStatusText = () => {
    if (showReconnecting) return "Reconnected";
    if (!isOnline) return "Offline";
    if (isLowQuality) return "Poor Connection";
    return connectionType === 'wifi' ? "Online (WiFi)" : "Online";
  };
  
  // If using badge variant
  if (variant === 'badge') {
    return (
      <Badge variant={isOnline ? "outline" : "secondary"} className={cn(
        getColor(),
        "flex items-center gap-1.5",
        className
      )}>
        {getIcon()}
        <span>{getStatusText()}</span>
      </Badge>
    );
  }
  
  // Default icon or full variant
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-1.5 transition-colors duration-300",
            getColor(),
            className
          )}>
            {getIcon()}
            {(showText || variant === 'full') && <span className="text-sm">{getStatusText()}</span>}
            {showQuality && quality !== 'unknown' && <span className="text-xs opacity-80">({quality})</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {getStatusText()}
            {isOnline && connectionType && ` (${connectionType})`}
          </p>
          {!isOnline && (
            <p className="text-xs text-amber-400">Some features may be limited</p>
          )}
          {isLowQuality && isOnline && (
            <p className="text-xs text-amber-400">Reduced performance mode active</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ConnectionStateIndicator;
