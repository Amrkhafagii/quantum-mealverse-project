
import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Platform } from '@/utils/platform';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import NativeMap from './NativeMap';

const GoogleMap = React.lazy(() => import('./DeliveryGoogleMap'));

interface LazyMapProps {
  mapId: string;
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    type?: string;
  }>;
  showRoute?: boolean;
  routeOrigin?: { lat: number; lng: number };
  routeDestination?: { lat: number; lng: number };
  height?: string;
  width?: string;
  className?: string;
  lowPerformanceMode?: boolean;
  forceWebView?: boolean;
  enableAnimation?: boolean;
  enableControls?: boolean;
  isNative?: boolean; // Added this prop
}

const LazyMap: React.FC<LazyMapProps> = ({
  mapId,
  center,
  zoom = 14,
  markers = [],
  showRoute = false,
  routeOrigin,
  routeDestination,
  height = '300px',
  width,
  className = '',
  lowPerformanceMode = false,
  forceWebView = false,
  enableAnimation = true,
  enableControls = true,
  isNative = Platform.isNative() && !forceWebView, // Default value based on platform
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

  return (
    <div className={`relative ${className}`} style={{ width: width || '100%', height }}>
      {isLoading && (
        <Skeleton className="w-full h-full absolute top-0 left-0" />
      )}
      
      <div className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} ref={mapElementRef}>
        {isNative ? (
          <NativeMap
            mapId={mapId}
            center={center}
            zoom={zoom}
            markers={markers}
            height={height}
            width={width}
            className={className}
            liteMode={useLowPerformanceMode}
          />
        ) : (
          <React.Suspense fallback={<Skeleton className="w-full h-full" />}>
            <GoogleMap
              mapId={mapId}
              center={center}
              zoom={zoom} 
              markers={markers}
              showRoute={showRoute}
              routeOrigin={routeOrigin}
              routeDestination={routeDestination}
              height={height}
              width={width}
              className={className}
              lowPerformanceMode={useLowPerformanceMode}
              enableAnimation={enableAnimation && !useLowPerformanceMode}
              enableControls={enableControls && !useLowPerformanceMode}
              onLoad={handleMapLoad}
            />
          </React.Suspense>
        )}
      </div>
    </div>
  );
};

export default LazyMap;
