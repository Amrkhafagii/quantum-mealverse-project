
import React from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@/utils/platform';
import LazyMap from './LazyMap';
import { Loader2 } from 'lucide-react';
import { useMapView } from '@/contexts/MapViewContext';
import { AccuracyLevel } from '../location/LocationAccuracyIndicator';

interface MapContainerProps {
  className?: string;
  driverLocation?: any;
  customerLocation?: any;
  restaurantLocation?: any;
  children?: React.ReactNode;
  showRoute?: boolean;
  isInteractive?: boolean;
  height?: string;
  mapId?: string;
  lowPerformanceMode?: boolean;
  enableControls?: boolean;
  enableAnimation?: boolean;
  zoomLevel?: number;
  locations?: any[]; // Support the old locations prop for backward compatibility
  forceWebView?: boolean; // Force web view even on native platforms
  locationAccuracy?: AccuracyLevel; // Added the location accuracy prop
  showAccuracyCircle?: boolean; // Added the show accuracy circle prop
}

const MapContainer: React.FC<MapContainerProps> = ({
  className,
  driverLocation,
  customerLocation,
  restaurantLocation,
  children,
  showRoute = true,
  isInteractive = true,
  height = 'h-[300px]',
  mapId = 'default-map',
  lowPerformanceMode: forceLowPerformanceMode,
  enableControls = true,
  enableAnimation = true,
  zoomLevel = 13,
  locations = [],
  forceWebView = false,
  locationAccuracy, // Added the locationAccuracy prop
  showAccuracyCircle // Added the showAccuracyCircle prop
}) => {
  const { googleMapsApiKey } = useGoogleMaps();
  const { lowPerformanceMode: contextLowPerformanceMode } = useMapView();
  
  // Use forced low performance mode or get from context
  const lowPerformanceMode = forceLowPerformanceMode !== undefined ? 
    forceLowPerformanceMode : contextLowPerformanceMode;
  
  // Check if we're on a native platform
  const isNativePlatform = Capacitor.isNativePlatform() && !forceWebView;

  return (
    <Card className={className}>
      <CardContent className={`p-0 overflow-hidden ${height} relative`}>
        {!googleMapsApiKey ? (
          <div className="p-4 flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        ) : (
          <LazyMap
            mapId={mapId}
            isNative={isNativePlatform}
            driverLocation={driverLocation}
            customerLocation={customerLocation}
            restaurantLocation={restaurantLocation}
            showRoute={showRoute}
            isInteractive={isInteractive}
            height={height}
            lowPerformanceMode={lowPerformanceMode}
            enableControls={enableControls}
            enableAnimation={enableAnimation}
            zoomLevel={zoomLevel}
            locations={locations}
            locationAccuracy={locationAccuracy} // Pass through locationAccuracy prop
            showAccuracyCircle={showAccuracyCircle} // Pass through showAccuracyCircle prop
          />
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default MapContainer;
