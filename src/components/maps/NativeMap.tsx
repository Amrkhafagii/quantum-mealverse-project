
import React, { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorGoogleMaps } from '@capacitor-community/capacitor-googlemaps-native';
import { Platform } from '@/utils/platform';

interface NativeMapProps {
  mapId: string;
  center: { lat: number; lng: number };
  height: string;
  width?: string;
  zoom?: number;
  markers?: Array<{
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    type?: string;
  }>;
  className?: string;
  liteMode?: boolean;
}

const NativeMap: React.FC<NativeMapProps> = ({
  mapId,
  center,
  height,
  width = '100%',
  zoom = 14,
  markers = [],
  className = '',
  liteMode = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || !Platform.isNative()) return;
      
      try {
        // Get bounds of the mapRef element
        const bounds = mapRef.current.getBoundingClientRect();
        
        // Initialize the map
        await CapacitorGoogleMaps.create({
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
          latitude: center.lat,
          longitude: center.lng,
          zoom: zoom,
          liteMode: liteMode
        });
        
        setMapInitialized(true);
        
        // Add markers if provided
        if (markers && markers.length > 0) {
          await Promise.all(
            markers.map(async (marker) => {
              await CapacitorGoogleMaps.addMarker({
                latitude: marker.latitude,
                longitude: marker.longitude,
                title: marker.title || '',
                snippet: marker.description || '',
                opacity: 1.0,
                isFlat: false,
                iconUrl: marker.type === 'restaurant' 
                  ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                  : marker.type === 'customer'
                  ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                  : marker.type === 'driver'
                  ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                  : undefined
              });
            })
          );
        }
      } catch (err) {
        console.error('Failed to initialize native map:', err);
      }
    };
    
    initMap();
    
    return () => {
      // Clean up the map when component unmounts
      if (mapInitialized) {
        try {
          // Use the destroy method instead which does exist in the API
          if (typeof CapacitorGoogleMaps.destroy === 'function') {
            CapacitorGoogleMaps.destroy();
          } else {
            console.warn("CapacitorGoogleMaps.destroy method not available");
          }
        } catch (err) {
          console.error('Error cleaning up map:', err);
        }
      }
    };
  }, [center, zoom, markers, liteMode]);

  return (
    <div 
      ref={mapRef} 
      id={mapId}
      className={`native-map ${className}`}
      style={{
        height,
        width: width || '100%',
        background: '#f0f0f0',
      }}
    >
      {!Platform.isNative() && (
        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
          Native map only available on iOS/Android
        </div>
      )}
    </div>
  );
};

export default NativeMap;
