
import React, { Suspense, lazy } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Platform } from '@/utils/platform';
import { useMapService } from '@/contexts/MapServiceContext';

// Lazy load map implementations
const StandardGoogleMap = lazy(() => import('./StandardGoogleMap'));
const LazyMap = lazy(() => import('./LazyMap'));
const UnifiedMapView = lazy(() => import('./UnifiedMapView'));
const NativeMap = lazy(() => import('./NativeMap'));

export interface MapComponentProps {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  height?: string;
  width?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title?: string;
    type?: string;
    icon?: string | google.maps.Icon;
    onClick?: () => void;
  }>;
  showRoute?: boolean;
  isInteractive?: boolean;
  forceImplementation?: 'standard' | 'lazy' | 'unified' | 'native';
  onMapReady?: () => void;
  children?: React.ReactNode;
}

/**
 * MapComponent - Factory component that renders the appropriate map implementation
 * 
 * This component standardizes the interface for all map components and chooses
 * the best implementation based on the current environment and performance needs.
 */
export const MapComponent: React.FC<MapComponentProps> = ({
  id,
  className = '',
  style,
  height = '300px',
  width = '100%',
  center,
  zoom = 14,
  markers = [],
  showRoute = false,
  isInteractive = true,
  forceImplementation,
  onMapReady,
  children
}) => {
  const { googleMapsApiKey } = useGoogleMaps();
  const { performanceLevel } = useMapService();
  const isNative = Platform.isNative();
  
  // Determine which implementation to use
  const getImplementation = () => {
    if (forceImplementation) return forceImplementation;
    
    // If on native platform, use the native implementation
    if (isNative) return 'native';
    
    // Otherwise, choose based on performance level
    if (performanceLevel === 'low') return 'lazy';
    if (performanceLevel === 'medium') return 'unified';
    return 'standard'; // Default for high performance
  };
  
  // Get the actual implementation to render
  const implementation = getImplementation();
  
  // Common props for all map implementations
  const commonProps = {
    id,
    center: center ? { lat: center.lat, lng: center.lng } : undefined,
    zoom,
    markers: markers.map(m => ({ 
      ...m,
      position: m.position || { lat: 0, lng: 0 }
    })),
    onLoad: onMapReady,
  };
  
  const containerStyle = {
    ...style,
    height,
    width
  };
  
  // If no API key, show a placeholder
  if (!googleMapsApiKey) {
    return (
      <Card className={className} style={containerStyle}>
        <div className="flex items-center justify-center w-full h-full text-sm text-muted-foreground">
          Google Maps API key required
        </div>
      </Card>
    );
  }

  return (
    <Suspense fallback={<Skeleton className={className} style={containerStyle} />}>
      <div className={className} style={containerStyle}>
        {implementation === 'standard' && (
          <StandardGoogleMap
            {...commonProps}
            options={{
              zoomControl: isInteractive,
              streetViewControl: isInteractive,
              mapTypeControl: isInteractive && performanceLevel === 'high',
              fullscreenControl: isInteractive && performanceLevel === 'high',
            }}
          >
            {children}
          </StandardGoogleMap>
        )}
        
        {implementation === 'lazy' && (
          <LazyMap
            mapId={id}
            center={center ? {
              latitude: center.lat, 
              longitude: center.lng
            } : undefined}
            zoom={zoom}
            markers={markers.map(m => ({
              latitude: m.position.lat,
              longitude: m.position.lng,
              title: m.title,
              type: m.type,
            }))}
            height={height}
            className={className}
            lowPerformanceMode={performanceLevel === 'low'}
            enableControls={isInteractive}
            showRoute={showRoute}
          />
        )}
        
        {implementation === 'unified' && (
          <UnifiedMapView
            mapId={id}
            center={center ? {
              latitude: center.lat, 
              longitude: center.lng
            } : undefined}
            zoomLevel={zoom}
            additionalMarkers={markers.map(m => ({
              latitude: m.position.lat,
              longitude: m.position.lng,
              title: m.title,
              type: m.type,
            }))}
            height={height}
            className={className}
            lowPerformanceMode={performanceLevel === 'low'}
            isInteractive={isInteractive}
            onMapReady={onMapReady}
          />
        )}
        
        {implementation === 'native' && (
          <NativeMap
            mapId={id}
            center={center ? {
              latitude: center.lat,
              longitude: center.lng
            } : undefined}
            zoom={zoom}
            markers={markers.map(m => ({
              latitude: m.position.lat,
              longitude: m.position.lng,
              title: m.title || '',
              type: m.type || '',
            }))}
            height={height}
            width={width}
            className={className}
            liteMode={performanceLevel === 'low'}
          />
        )}
      </div>
    </Suspense>
  );
};

export default MapComponent;
