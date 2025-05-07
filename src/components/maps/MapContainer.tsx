
import React from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Capacitor } from '@capacitor/core';
import LazyMap from './LazyMap';
import { Loader2 } from 'lucide-react';

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
  lowPerformanceMode = false,
  enableControls = true,
  enableAnimation = true,
  zoomLevel = 13,
  locations = []
}) => {
  const { googleMapsApiKey } = useGoogleMaps();
  const isNative = Capacitor.isNativePlatform();

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
            isNative={isNative}
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
          />
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default MapContainer;
