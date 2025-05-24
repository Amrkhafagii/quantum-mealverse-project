
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MapPin, RefreshCw, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDeliveryLocationService } from '@/hooks/useDeliveryLocationService';
import { LocationStatusIndicator } from '@/components/location/LocationStatusIndicator';
import { useMapView } from '@/contexts/MapViewContext';
import { TrackingMode } from '@/utils/trackingModeCalculator';
import { DeliveryLocation } from '@/types/location';

export interface DeliveryLocationControlsProps {
  className?: string;
  showAccuracy?: boolean;
  showBatteryOptimization?: boolean;
  onLocationUpdate?: (location: DeliveryLocation) => void;
  showHelp?: boolean;
}

export const DeliveryLocationControls: React.FC<DeliveryLocationControlsProps> = ({
  className = '',
  showAccuracy = true,
  showBatteryOptimization = true,
  onLocationUpdate,
  showHelp = false
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const locationService = useDeliveryLocationService({ 
    enableEnergyEfficiency: true,
    trackOnLoad: true
  });
  const { lastLocation, refreshLocation, isTracking, trackingMode } = locationService;
  const mapViewContext = useMapView();
  
  // Calculate freshness based on lastRefreshTime
  const getFreshness = (): 'fresh' | 'stale' | 'invalid' => {
    if (!lastLocation) return 'invalid';
    
    const now = Date.now();
    const lastUpdateTime = lastLocation.timestamp;
    const diffMinutes = (now - lastUpdateTime) / (1000 * 60);
    
    if (diffMinutes < 1) return 'fresh';
    if (diffMinutes < 5) return 'stale';
    return 'invalid';
  };

  const freshness = getFreshness();
  
  // Handle location refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      const location = await refreshLocation();
      
      if (location && mapViewContext.setCenter) {
        // Center map on new location
        mapViewContext.setCenter({
          lat: location.latitude,
          lng: location.longitude
        });
      }
      
      if (location && onLocationUpdate) {
        onLocationUpdate(location);
      }
    } catch (error) {
      console.error('Error refreshing location:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Get status color based on freshness
  const getStatusColor = () => {
    switch (freshness) {
      case 'fresh':
        return 'bg-green-500';
      case 'stale':
        return 'bg-yellow-500';
      case 'invalid':
      default:
        return 'bg-red-500';
    }
  };
  
  // Get readable status text
  const getStatusText = () => {
    switch (freshness) {
      case 'fresh':
        return 'Current';
      case 'stale':
        return 'Outdated';
      case 'invalid':
      default:
        return 'Invalid';
    }
  };
  
  // Get tracking mode badge info
  const getTrackingModeBadge = () => {
    const mode = trackingMode as string;
    
    switch (mode) {
      case 'passive':
        return {
          text: 'Battery Saving',
          color: 'bg-yellow-500',
          icon: <Zap className="h-3 w-3 mr-1" />
        };
      case 'balanced':
        return {
          text: 'Balanced',
          color: 'bg-blue-500',
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />
        };
      case 'high-precision':
        return {
          text: 'High Precision',
          color: 'bg-green-500',
          icon: <MapPin className="h-3 w-3 mr-1" />
        };
      case 'standard':
      default:
        return {
          text: 'Standard',
          color: 'bg-zinc-500',
          icon: <MapPin className="h-3 w-3 mr-1" />
        };
    }
  };
  
  const trackingBadge = getTrackingModeBadge();

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center space-x-2">
          {/* Location Status Badge */}
          <Badge 
            variant="outline" 
            className={`flex items-center ${getStatusColor()} text-white`}
          >
            <MapPin className="h-3 w-3 mr-1" />
            {getStatusText()}
          </Badge>
          
          {/* Tracking Mode Badge */}
          {isTracking && (
            <Badge 
              variant="outline"
              className={`flex items-center ${trackingBadge.color} text-white`}
            >
              {trackingBadge.icon}
              {trackingBadge.text}
            </Badge>
          )}
        </div>
        
        {/* Refresh Button */}
        <Button 
          size="sm" 
          variant="ghost"
          disabled={isRefreshing}
          onClick={handleRefresh}
          className="px-2 py-1 h-7"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh location</span>
        </Button>
      </div>
      
      {/* Status Indicators */}
      {lastLocation && showAccuracy && (
        <LocationStatusIndicator
          accuracy={lastLocation.accuracy || undefined}
          trackingMode={trackingMode as TrackingMode}
          isTracking={isTracking}
        />
      )}
      
      {/* Help text if needed */}
      {showHelp && (
        <div className="text-xs text-muted-foreground mt-2 px-2">
          <p>Tap the refresh button to update your location.</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryLocationControls;
