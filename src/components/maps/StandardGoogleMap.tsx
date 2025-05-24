
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { GoogleMapFactory } from './GoogleMapFactory';
import { useMapService } from '@/contexts/MapServiceContext';
import { LazyGoogleMapsLoader } from './LazyGoogleMapsLoader';
import { useNetworkRetry } from '@/hooks/useNetworkRetry';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

// Using GoogleMap component from react-google-maps/api
const GoogleMap = React.lazy(() => 
  import('@react-google-maps/api').then(module => ({
    default: module.GoogleMap
  }))
);

// Using Marker component from react-google-maps/api
const Marker = React.lazy(() => 
  import('@react-google-maps/api').then(module => ({
    default: module.Marker
  }))
);

export interface StandardGoogleMapProps {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title?: string;
    icon?: string | google.maps.Icon;
    onClick?: () => void;
  }>;
  options?: google.maps.MapOptions;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onLoad?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
}

/**
 * StandardGoogleMap - Component that implements Google-recommended lazy loading patterns
 * 
 * This component follows best practices:
 * 1. Uses React.lazy for code-splitting of map components
 * 2. Lazy loads the JS API only when the map is visible 
 * 3. Provides standardized loading, error states and fallbacks
 * 4. Centralizes API key management
 */
export const StandardGoogleMap: React.FC<StandardGoogleMapProps> = ({
  id,
  className,
  style,
  center = { lat: 0, lng: 0 },
  zoom = 14,
  markers = [],
  options = {},
  onClick,
  onLoad,
  children,
}) => {
  const { performanceLevel } = useMapService();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<Error | null>(null);
  
  // Use network retry for loading operations
  const { execute: loadMap, isRetrying } = useNetworkRetry(async () => {
    // This is a dummy function that represents map loading operations
    // Real loading happens in the GoogleMap component onLoad callback
    return true;
  });
  
  // Load map when component mounts
  useEffect(() => {
    loadMap().catch(err => {
      setMapLoadError(err instanceof Error ? err : new Error('Failed to load map'));
    });
  }, []);
  
  // Apply performance optimizations
  const getOptimizedOptions = () => {
    let optimizedOptions = {
      ...options,
      disableDefaultUI: options.disableDefaultUI ?? (performanceLevel === 'low'),
    };
    
    // Apply performance-specific optimizations
    if (performanceLevel === 'low') {
      optimizedOptions = {
        ...optimizedOptions,
        disableDefaultUI: true,
        draggable: false,
        zoomControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        styles: [{ stylers: [{ saturation: -100 }, { lightness: 20 }] }], // Simplified style
        maxZoom: 15,
        minZoom: 8,
      };
    } else if (performanceLevel === 'medium') {
      optimizedOptions = {
        ...optimizedOptions,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      };
    }
    
    return optimizedOptions;
  };
  
  const handleMapLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setIsMapReady(true);
    if (onLoad) onLoad(mapInstance);
  };
  
  return (
    <Card className={className} style={{ ...style, overflow: 'hidden' }}>
      <GoogleMapFactory
        render={(isLoaded) => (
          <LazyGoogleMapsLoader
            fallback={
              <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-muted">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            }
            onError={(err) => setMapLoadError(err)}
          >
            <GoogleMap
              id={id}
              mapContainerStyle={{ width: '100%', height: '100%', minHeight: '200px' }}
              center={center}
              zoom={zoom}
              options={getOptimizedOptions()}
              onLoad={handleMapLoad}
              onClick={onClick}
            >
              {/* Render markers only when map is ready */}
              {isMapReady && markers.map(marker => (
                <Marker
                  key={marker.id}
                  position={marker.position}
                  title={marker.title}
                  icon={marker.icon}
                  onClick={marker.onClick}
                />
              ))}
              
              {/* Render children only when map is ready */}
              {isMapReady && children}
            </GoogleMap>
          </LazyGoogleMapsLoader>
        )}
        loadingFallback={
          <Skeleton className="w-full h-full min-h-[200px]" />
        }
        errorFallback={
          <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px] p-4 bg-destructive/10 text-destructive">
            <p className="font-semibold">Failed to load map</p>
            <p className="text-sm">{mapLoadError?.message || 'Unknown error'}</p>
          </div>
        }
      />
    </Card>
  );
};

export default StandardGoogleMap;
