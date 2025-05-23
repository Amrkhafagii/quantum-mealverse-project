
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Capacitor } from '@capacitor/core';
import { AccuracyLevel } from '../location/LocationAccuracyIndicator';
import { GoogleMap } from '@capacitor-community/capacitor-googlemaps-native';
import { toast } from 'sonner';

interface NativeMapProps {
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
  height?: string;
  width?: string;
  className?: string;
  liteMode?: boolean;
  locationAccuracy?: AccuracyLevel;
  showAccuracyCircle?: boolean;
  onMapReady?: () => void;
}

const NativeMap: React.FC<NativeMapProps> = ({
  mapId,
  center,
  zoom = 14,
  markers = [],
  height = '300px',
  width,
  className = '',
  liteMode = false,
  locationAccuracy,
  showAccuracyCircle,
  onMapReady
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Initialize the map when the component mounts
  useEffect(() => {
    let googleMap: typeof GoogleMap | null = null;

    const initializeMap = async () => {
      if (!mapRef.current || !Capacitor.isNativePlatform()) {
        // If not on a native platform or ref not ready, bail out
        return;
      }

      try {
        // Create the map
        googleMap = await GoogleMap.create({
          id: mapId,
          element: mapRef.current,
          apiKey: '', // API key is set in capacitor.config.ts
          config: {
            center: center,
            zoom: zoom,
            disableDefaultUI: liteMode,
            styles: [], // Can add styles here if needed
            clickableIcons: !liteMode
          }
        });

        // Add markers to the map
        await addMarkersToMap(googleMap);

        // Add accuracy circle if needed
        if (showAccuracyCircle) {
          await addAccuracyCircle(googleMap);
        }

        setMapInitialized(true);
        
        // Notify parent that map is ready
        if (onMapReady) onMapReady();

      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        toast.error('Failed to load the map. Please check your network connection.');
      }
    };

    // Add markers to the map
    const addMarkersToMap = async (map: typeof GoogleMap) => {
      for (const marker of markers) {
        let markerOptions: any = {
          coordinate: {
            lat: marker.latitude,
            lng: marker.longitude
          },
          title: marker.title || '',
          snippet: marker.description || ''
        };

        // Set marker icon based on type
        switch (marker.type) {
          case 'restaurant':
            markerOptions.iconUrl = 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
            break;
          case 'customer':
            markerOptions.iconUrl = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
            break;
          case 'driver':
            markerOptions.iconUrl = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
            break;
          default:
            markerOptions.iconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
        }

        await map.addMarker(markerOptions);
      }
    };
    
    const addAccuracyCircle = async (map: typeof GoogleMap) => {
      // Find the user marker (usually of type 'driver')
      const userMarker = markers.find(m => m.type === 'driver');
      
      if (!userMarker || !locationAccuracy) return;
      
      // Determine radius based on accuracy level
      let radius = 100; // Default
      if (locationAccuracy === 'high') radius = 50;
      else if (locationAccuracy === 'medium') radius = 100;
      else if (locationAccuracy === 'low') radius = 500;
      
      // Add a circle to represent accuracy
      await map.addCircle({
        center: {
          lat: userMarker.latitude,
          lng: userMarker.longitude
        },
        radius: radius,
        strokeColor: '#3388FF',
        strokeWidth: 2,
        fillColor: 'rgba(51, 136, 255, 0.2)'
      });
    };

    // Add map controls
    const addMapControls = async (map: typeof GoogleMap) => {
      if (liteMode) return; // Skip controls in lite mode
      
      // We don't add UI controls here because the native Google Maps
      // already has built-in controls that are platform-specific
    };

    initializeMap();
    
    // Cleanup the map when the component unmounts
    return () => {
      if (googleMap) {
        GoogleMap.remove({ id: mapId });
      }
    };
  }, [mapId, center, zoom, markers, liteMode, locationAccuracy, showAccuracyCircle]);

  // Update the map when center changes
  useEffect(() => {
    const updateMapCenter = async () => {
      if (mapInitialized && Capacitor.isNativePlatform()) {
        try {
          await GoogleMap.setCamera({
            id: mapId,
            config: {
              coordinate: { lat: center.lat, lng: center.lng },
              animate: true,
              animationDuration: 500
            }
          });
        } catch (error) {
          console.error('Error updating map center:', error);
        }
      }
    };

    updateMapCenter();
  }, [center, mapId, mapInitialized]);

  // Render the map container
  return (
    <Card 
      className={`${className} overflow-hidden`}
      style={{
        width: width || '100%',
        height: height || '300px'
      }}
    >
      <div 
        ref={mapRef} 
        id={`native-map-${mapId}`} 
        style={{ width: '100%', height: '100%' }}
        className="capacitor-google-map"
      />
    </Card>
  );
};

export default NativeMap;
