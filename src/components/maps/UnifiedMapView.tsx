
import React, { useState } from 'react';
import { Platform } from '@/utils/platform';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import MapContainer from './MapContainer';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map } from 'lucide-react';
import { OfflineMapFallback } from './OfflineMapFallback';
import { AccuracyLevel } from '../location/LocationAccuracyIndicator';

interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: string;
  accuracy?: number;
  timestamp?: string;
}

interface UnifiedMapViewProps {
  driverLocation?: MapLocation;
  restaurantLocation?: MapLocation;
  customerLocation?: MapLocation;
  showRoute?: boolean;
  className?: string;
  height?: string;
  mapId?: string;
  onBackClick?: () => void;
  showBackButton?: boolean;
  title?: string;
  additionalMarkers?: MapLocation[];
  onMapClick?: (location: { latitude: number; longitude: number }) => void;
  isInteractive?: boolean;
  showHeader?: boolean;
  zoomLevel?: number;
  locationAccuracy?: AccuracyLevel;
  showAccuracyCircle?: boolean;
}

const UnifiedMapView: React.FC<UnifiedMapViewProps> = ({
  driverLocation,
  restaurantLocation,
  customerLocation,
  showRoute = true,
  className = '',
  height = 'h-[300px]',
  mapId = 'unified-map',
  onBackClick,
  showBackButton = false,
  title = 'Map View',
  additionalMarkers = [],
  onMapClick,
  isInteractive = true,
  showHeader = true,
  zoomLevel = 13,
  locationAccuracy,
  showAccuracyCircle = false
}) => {
  const { isOnline } = useConnectionStatus();
  const { quality, isLowQuality } = useNetworkQuality();
  const [isMapEnabled, setIsMapEnabled] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const isMobile = Platform.isNative();
  
  const handleRetry = () => {
    if (!isOnline) return;
    
    setIsRetrying(true);
    setIsMapEnabled(true);
    
    setTimeout(() => {
      setIsRetrying(false);
    }, 2000);
  };
  
  // If offline or map disabled, show fallback
  if (!isOnline || !isMapEnabled) {
    return (
      <OfflineMapFallback
        title={!isOnline ? "Offline Mode" : "Map Disabled"}
        description={!isOnline 
          ? "Map is unavailable while offline" 
          : "Map has been disabled due to poor connection quality"
        }
        retry={handleRetry}
        isRetrying={isRetrying}
        showLocationData={true}
        locationData={{
          latitude: customerLocation?.latitude || restaurantLocation?.latitude,
          longitude: customerLocation?.longitude || restaurantLocation?.longitude,
          address: customerLocation?.description || restaurantLocation?.description,
        }}
        className={className}
      />
    );
  }
  
  return (
    <div className={`${className}`}>
      {showHeader && (
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="flex items-center">
            {showBackButton && (
              <Button variant="ghost" size="sm" onClick={onBackClick} className="mr-2 p-0 h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h3 className="text-sm font-medium flex items-center">
              <Map className="h-4 w-4 mr-1" />
              {title}
            </h3>
          </div>
          {isLowQuality && (
            <span className="text-xs text-amber-500">Low-bandwidth mode</span>
          )}
        </div>
      )}
      
      <MapContainer
        mapId={mapId}
        driverLocation={driverLocation}
        customerLocation={customerLocation}
        restaurantLocation={restaurantLocation}
        showRoute={showRoute}
        height={height}
        isInteractive={isInteractive}
        lowPerformanceMode={isLowQuality}
        enableAnimation={!isLowQuality}
        enableControls={!isLowQuality && isInteractive}
        zoomLevel={zoomLevel}
        locations={additionalMarkers}
        forceWebView={false}
        locationAccuracy={locationAccuracy}
        showAccuracyCircle={showAccuracyCircle}
      />
    </div>
  );
};

export default UnifiedMapView;
