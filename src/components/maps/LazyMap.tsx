
import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Platform } from '@/utils/platform';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import NativeMap from './NativeMap';
import { AccuracyLevel } from '../location/LocationAccuracyIndicator';

const GoogleMap = React.lazy(() => import('./DeliveryGoogleMap'));

interface LazyMapProps {
  mapId: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    type?: string;
  }>;
  height?: string;
  width?: string;
  className?: string;
  lowPerformanceMode?: boolean;
  forceWebView?: boolean;
  enableAnimation?: boolean;
  enableControls?: boolean;
  isNative?: boolean;
  
  // Adding missing props that are passed from MapContainer
  driverLocation?: any;
  customerLocation?: any;
  restaurantLocation?: any;
  isInteractive?: boolean;
  zoomLevel?: number;
  locations?: any[];
  locationAccuracy?: AccuracyLevel;
  showAccuracyCircle?: boolean;
}

const LazyMap: React.FC<LazyMapProps> = ({
  mapId,
  center = { lat: 0, lng: 0 },
  zoom = 14,
  markers = [],
  height = '300px',
  width,
  className = '',
  lowPerformanceMode = false,
  forceWebView = false,
  enableAnimation = true,
  enableControls = true,
  isNative = Platform.isNative() && !forceWebView,
  driverLocation,
  customerLocation,
  restaurantLocation,
  isInteractive = true,
  zoomLevel,
  locations = [],
  locationAccuracy,
  showAccuracyCircle
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const { quality, isLowQuality } = useNetworkQuality();
  const mapElementRef = useRef<HTMLDivElement>(null);
  
  // Use low performance mode if network quality is low or explicitly set
  const useLowPerformanceMode = lowPerformanceMode || isLowQuality;
  
  useEffect(() => {
    // Simulate map load time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleMapLoad = () => {
    setIsLoading(false);
  };

  // Compute derived center location for the map
  const computedCenter = React.useMemo(() => {
    if (driverLocation) return { lat: driverLocation.latitude, lng: driverLocation.longitude };
    if (customerLocation) return { lat: customerLocation.latitude, lng: customerLocation.longitude };
    if (restaurantLocation) return { lat: restaurantLocation.latitude, lng: restaurantLocation.longitude };
    if (center) return center;
    return { lat: 0, lng: 0 };
  }, [driverLocation, customerLocation, restaurantLocation, center]);

  // Convert locations to markers if provided
  const computedMarkers = React.useMemo(() => {
    const allMarkers = [...markers];
    
    if (driverLocation) {
      allMarkers.push({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        title: "Driver",
        type: "driver"
      });
    }
    
    if (customerLocation) {
      allMarkers.push({
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
        title: "Customer",
        type: "customer"
      });
    }
    
    if (restaurantLocation) {
      allMarkers.push({
        latitude: restaurantLocation.latitude,
        longitude: restaurantLocation.longitude,
        title: "Restaurant",
        type: "restaurant"
      });
    }
    
    // Add any additional locations
    if (locations && locations.length > 0) {
      locations.forEach(loc => {
        if (loc.latitude && loc.longitude) {
          allMarkers.push({
            latitude: loc.latitude,
            longitude: loc.longitude,
            title: loc.title || "",
            type: loc.type || ""
          });
        }
      });
    }
    
    return allMarkers;
  }, [markers, driverLocation, customerLocation, restaurantLocation, locations]);

  return (
    <div className={`relative ${className}`} style={{ width: width || '100%', height }}>
      {isLoading && (
        <Skeleton className="w-full h-full absolute top-0 left-0" />
      )}
      
      <div className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} ref={mapElementRef}>
        {isNative ? (
          <NativeMap
            mapId={mapId}
            center={computedCenter}
            zoom={zoomLevel || zoom}
            markers={computedMarkers}
            height={height}
            width={width}
            className={className}
            liteMode={useLowPerformanceMode}
            locationAccuracy={locationAccuracy}
            showAccuracyCircle={showAccuracyCircle}
          />
        ) : (
          <React.Suspense fallback={<Skeleton className="w-full h-full" />}>
            <GoogleMap
              mapId={mapId}
              center={computedCenter}
              zoom={zoomLevel || zoom}
              markers={computedMarkers}
              height={height}
              width={width}
              className={className}
              lowPerformanceMode={useLowPerformanceMode}
              enableAnimation={enableAnimation && !useLowPerformanceMode}
              enableControls={enableControls && !useLowPerformanceMode}
              onLoad={handleMapLoad}
              locationAccuracy={locationAccuracy}
              showAccuracyCircle={showAccuracyCircle}
            />
          </React.Suspense>
        )}
      </div>
    </div>
  );
};

export default LazyMap;
