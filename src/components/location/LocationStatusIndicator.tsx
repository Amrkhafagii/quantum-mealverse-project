
import React from 'react';
import { TrackingMode } from '@/utils/trackingModeCalculator';
import { Card } from '@/components/ui/card';
import { Battery, Signal, MapPin } from 'lucide-react';
import { useBatteryStatus } from '@/hooks/useBatteryStatus';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type AccuracyLevel = 'high' | 'medium' | 'low' | 'unknown';

export interface LocationStatusIndicatorProps {
  accuracy?: number;
  trackingMode: TrackingMode;
  isTracking: boolean;
  className?: string;
  showBatteryStatus?: boolean;
  showTooltip?: boolean;
}

export const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({
  accuracy,
  trackingMode,
  isTracking,
  className = '',
  showBatteryStatus = true,
  showTooltip = false
}) => {
  const { isLowBattery, batteryLevel } = useBatteryStatus();
  
  // Determine accuracy level based on accuracy value
  const getAccuracyLevel = (): AccuracyLevel => {
    if (accuracy === undefined) return 'unknown';
    if (accuracy < 50) return 'high';
    if (accuracy < 200) return 'medium';
    return 'low';
  };
  
  const accuracyLevel = getAccuracyLevel();
  
  // Get color for accuracy indicator
  const getAccuracyColor = () => {
    switch (accuracyLevel) {
      case 'high':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-red-500';
      case 'unknown':
      default:
        return 'text-gray-500';
    }
  };
  
  // Get number of bars for accuracy visualization
  const getAccuracyBars = () => {
    switch (accuracyLevel) {
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      case 'unknown':
      default:
        return 0;
    }
  };
  
  // Get text description of accuracy
  const getAccuracyText = () => {
    switch (accuracyLevel) {
      case 'high':
        return `High (±${accuracy?.toFixed(0)}m)`;
      case 'medium':
        return `Medium (±${accuracy?.toFixed(0)}m)`;
      case 'low':
        return `Low (±${accuracy?.toFixed(0)}m)`;
      case 'unknown':
      default:
        return 'Unknown';
    }
  };
  
  // Get battery color
  const getBatteryColor = () => {
    if (isLowBattery) return 'text-red-500';
    if (batteryLevel && batteryLevel < 30) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  // No need to render if not tracking
  if (!isTracking) return null;

  const statusContent = (
    <div className={`text-xs text-muted-foreground flex justify-between px-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <Signal size={14} className={getAccuracyColor()} />
        <span>{getAccuracyText()}</span>
      </div>
      
      {showBatteryStatus && (
        <div className="flex items-center space-x-1">
          <Battery size={14} className={getBatteryColor()} />
          <span>
            {batteryLevel ? `${Math.round(batteryLevel)}%` : 'Unknown'}
            {isLowBattery ? ' (Low)' : ''}
          </span>
        </div>
      )}
    </div>
  );
  
  // Wrap with tooltip if showTooltip is true
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <Signal size={16} className={getAccuracyColor()} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {statusContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return statusContent;
};

export default LocationStatusIndicator;
