
import React from 'react';
import { Capacitor } from '@capacitor/core';
// Replace the import with the community version that's installed
import { CapacitorGoogleMaps } from '@capacitor-community/capacitor-googlemaps-native';
import { OfflineMapFallback } from './OfflineMapFallback';

interface NativeMapProps {
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  markers?: Array<{
    latitude: number;
    longitude: number;
    title?: string;
  }>;
  onMapReady?: () => void;
  onMarkerClick?: (markerId: string) => void;
  height?: string;
  width?: string;
  className?: string;
}

export const NativeMap: React.FC<NativeMapProps> = ({
  initialLocation,
  markers = [],
  onMapReady,
  onMarkerClick,
  height = '300px',
  width = '100%',
  className = '',
}) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [mapId, setMapId] = React.useState<string | null>(null);
  const [isMapAvailable, setIsMapAvailable] = React.useState(true);

  // Try to initialize the map
  React.useEffect(() => {
    if (!mapRef.current || mapId) return;

    const createMap = async () => {
      try {
        if (!Capacitor.isNativePlatform()) {
          console.warn('Native maps are only available on native platforms');
          setIsMapAvailable(false);
          return;
        }

        const mapData = await CapacitorGoogleMaps.create({
          element: mapRef.current!,
          forceCreate: true,
          id: `native-map-${Date.now()}`,
          config: {
            center: {
              lat: initialLocation?.latitude || 37.7749,
              lng: initialLocation?.longitude || -122.4194
            },
            zoom: 14,
            androidLiteMode: false
          }
        });

        setMapId(mapData.id);
        
        if (onMapReady) {
          onMapReady();
        }

        // Add markers
        if (markers.length > 0 && mapData.id) {
          await Promise.all(markers.map(marker => {
            return CapacitorGoogleMaps.addMarker({
              id: mapData.id,
              marker: {
                coordinate: {
                  lat: marker.latitude,
                  lng: marker.longitude
                },
                title: marker.title || '',
              }
            });
          }));
        }
      } catch (error) {
        console.error('Error initializing native map:', error);
        setIsMapAvailable(false);
      }
    };

    createMap();

    // Cleanup function
    return () => {
      if (mapId) {
        CapacitorGoogleMaps.remove({
          id: mapId
        }).catch(error => console.error('Error removing map:', error));
      }
    };
  }, [initialLocation, mapId, markers, onMapReady]);

  // Handle marker clicks
  React.useEffect(() => {
    if (!mapId || !onMarkerClick) return;

    const handleMarkerClick = (event: CustomEvent) => {
      onMarkerClick(event.detail.markerId);
    };

    document.addEventListener('googleMapMarkerClick', handleMarkerClick);

    return () => {
      document.removeEventListener('googleMapMarkerClick', handleMarkerClick);
    };
  }, [mapId, onMarkerClick]);

  if (!isMapAvailable) {
    return (
      <OfflineMapFallback 
        title="Native Maps Unavailable" 
        description="Native maps functionality is not available on this device."
        locationData={initialLocation ? {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude
        } : undefined}
        showLocationData={!!initialLocation}
        className={className}
      />
    );
  }

  return (
    <div 
      ref={mapRef}
      style={{ height, width }} 
      className={`native-map-container ${className}`}
    />
  );
};

export default NativeMap;
