
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMapService } from '@/contexts/MapServiceContext';
import { useLocationService } from '@/contexts/LocationServiceContext';
import { MapMarker, MapViewOptions } from '@/services/maps/MapService';

export interface StandardMapProps {
  mapId: string;
  className?: string;
  height?: string;
  width?: string;
  center?: { latitude: number; longitude: number };
  zoom?: number;
  markers?: MapMarker[];
  showUserLocation?: boolean;
  enableControls?: boolean;
  lowPerformanceMode?: boolean;
  showAccuracyCircle?: boolean;
  onMapReady?: () => void;
}

export const StandardMap: React.FC<StandardMapProps> = ({
  mapId,
  className = '',
  height = 'h-80',
  width = 'w-full',
  center,
  zoom = 14,
  markers = [],
  showUserLocation = true,
  enableControls = true,
  lowPerformanceMode = false,
  showAccuracyCircle = false,
  onMapReady
}) => {
  const { isLoading: isMapLoading, createMap, destroyMap, addCircle } = useMapService();
  const { currentLocation, locationAccuracy, isLoading: isLocationLoading } = useLocationService();
  
  const [mapInstance, setMapInstance] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Determine map center
  const mapCenter = center || 
    (showUserLocation && currentLocation ? 
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude } : 
      { latitude: 40.7128, longitude: -74.0060 }); // Default to NYC
  
  // Create all markers including user location if needed
  const allMarkers = [...markers];
  if (showUserLocation && currentLocation) {
    allMarkers.push({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      title: 'Your Location',
      type: 'driver'
    });
  }
  
  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (isMapLoading || isLocationLoading) return;
      
      try {
        setIsInitializing(true);
        
        // Create map with options
        const mapOptions: MapViewOptions = {
          center: mapCenter,
          zoom,
          markers: allMarkers,
          enableControls,
          liteMode: lowPerformanceMode
        };
        
        const id = await createMap(mapId, mapOptions);
        setMapInstance(id);
        
        // Add accuracy circle if needed
        if (showAccuracyCircle && currentLocation && locationAccuracy !== 'unknown') {
          // Determine radius based on accuracy level
          let radius = 100; // Default
          if (locationAccuracy === 'high') radius = 50;
          else if (locationAccuracy === 'medium') radius = 100;
          else if (locationAccuracy === 'low') radius = 500;
          
          await addCircle(id, {
            center: {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude
            },
            radius,
            strokeColor: '#3388FF',
            strokeWidth: 2,
            fillColor: 'rgba(51, 136, 255, 0.2)',
            fillOpacity: 0.2
          });
        }
        
        setIsMapReady(true);
        setIsInitializing(false);
        
        if (onMapReady) {
          onMapReady();
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsInitializing(false);
      }
    };
    
    initMap();
    
    // Clean up map on unmount
    return () => {
      if (mapInstance) {
        destroyMap(mapInstance).catch(console.error);
      }
    };
  }, [mapId]); // Limited dependencies to prevent recreating the map
  
  return (
    <Card className={`overflow-hidden ${className} ${height} ${width}`}>
      {(isInitializing || isMapLoading || isLocationLoading) && (
        <Skeleton className="w-full h-full" />
      )}
      <div id={mapId} className="w-full h-full" />
    </Card>
  );
};

export default StandardMap;
