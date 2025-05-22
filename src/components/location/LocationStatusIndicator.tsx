
import React, { useState, useEffect } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useDeliveryLocationService } from '@/hooks/useDeliveryLocationService';
import { MapPin, WifiOff, Clock, Battery, BatteryLow } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LocationFreshness } from '@/types/unifiedLocation';

interface LocationStatusIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBatteryStatus?: boolean;
  showTooltip?: boolean;
}

export const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({
  className,
  size = 'md',
  showBatteryStatus = true,
  showTooltip = false
}) => {
  const { isOnline, connectionType } = useConnectionStatus();
  const locationService = useDeliveryLocationService();
  const [currentFreshness, setCurrentFreshness] = useState<LocationFreshness>('fresh');
  
  // Extract required properties from the location service
  const { 
    isTracking = false,
    freshness = 'fresh', 
    isBatteryLow = false, 
    batteryLevel = null 
  } = locationService;

  // Use freshness from the service when available
  useEffect(() => {
    if (freshness) {
      // Use type assertion to ensure TypeScript understands this is a valid LocationFreshness
      setCurrentFreshness(freshness as LocationFreshness);
    }
  }, [freshness]);
  
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

  const statusIndicator = (
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
      ) : currentFreshness === 'stale' ? (
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

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {statusIndicator}
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {!isOnline 
                ? "Device is currently offline" 
                : !isTracking 
                ? "Location tracking is disabled" 
                : currentFreshness === 'stale' 
                ? "Location data may be outdated" 
                : "Location tracking is active"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return statusIndicator;
};

export default LocationStatusIndicator;
