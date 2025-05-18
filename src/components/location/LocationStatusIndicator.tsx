
import React from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useDeliveryLocationService } from '@/hooks/useDeliveryLocationService';
import { MapPin, WifiOff, Clock, Battery, BatteryLow } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationStatusIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBatteryStatus?: boolean;
}

export const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({
  className,
  size = 'md',
  showBatteryStatus = true
}) => {
  const { isOnline, connectionType } = useConnectionStatus();
  const { isTracking, freshness, isBatteryLow, batteryLevel } = useDeliveryLocationService();
  
  const sizeClasses = {
    sm: 'h-6 text-xs',
    md: 'h-8 text-sm',
    lg: 'h-10 text-base'
  };
  
  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 rounded-full bg-background/80 backdrop-blur-sm border',
      sizeClasses[size],
      !isOnline ? 'border-red-500' : isTracking ? 'border-green-500' : 'border-yellow-500',
      className
    )}>
      {!isOnline ? (
        <>
          <WifiOff size={iconSize[size]} className="text-red-500" />
          <span className="text-red-500 font-medium">Offline</span>
        </>
      ) : !isTracking ? (
        <>
          <MapPin size={iconSize[size]} className="text-yellow-500" />
          <span className="text-yellow-500 font-medium">Location Off</span>
        </>
      ) : freshness === 'stale' ? (
        <>
          <Clock size={iconSize[size]} className="text-yellow-500" />
          <span className="text-yellow-500 font-medium">Stale</span>
        </>
      ) : (
        <>
          <MapPin size={iconSize[size]} className="text-green-500" />
          <span className="text-green-500 font-medium">
            {connectionType ? `${connectionType}` : 'Connected'}
          </span>
        </>
      )}
      
      {showBatteryStatus && batteryLevel !== null && (
        <div className="border-l pl-2 ml-2 flex items-center gap-1">
          {isBatteryLow ? (
            <BatteryLow size={iconSize[size]} className="text-red-500" />
          ) : (
            <Battery size={iconSize[size]} className="text-green-500" />
          )}
          <span className={cn(
            "font-medium",
            isBatteryLow ? "text-red-500" : "text-green-500"
          )}>
            {batteryLevel}%
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationStatusIndicator;
