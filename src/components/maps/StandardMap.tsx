
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMapService } from '@/contexts/MapServiceContext';
import { useLocationService } from '@/contexts/LocationServiceContext';
import { MapMarker, MapViewOptions } from '@/services/maps/MapService';
import { Platform } from '@/utils/platform';
import debounce from 'lodash/debounce';

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
  onMapClick?: (lat: number, lng: number) => void;
  refreshInterval?: number;
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
  onMapReady,
  onMapClick,
  refreshInterval,
}) => {
  const { isLoading: isMapLoading, createMap, destroyMap, addCircle, addMapClickListener } = useMapService();
  const { currentLocation, locationAccuracy, isLoading: isLocationLoading } = useLocationService();
  
  const [mapInstance, setMapInstance] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const mapClickListenerId = useRef<string | null>(null);
  const markersRef = useRef(markers);
  
  // Update markers ref when markers prop changes
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);
  
  // Handle auto-refresh interval for dynamic data
  useEffect(() => {
    if (!refreshInterval || !mapInstance) return;
    
    const intervalId = setInterval(() => {
      refreshMap();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, mapInstance, isMapReady]);
  
  // Determine map center
  const mapCenter = center || 
    (showUserLocation && currentLocation ? 
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude } : 
      { latitude: 40.7128, longitude: -74.0060 }); // Default to NYC
  
  // Create all markers including user location if needed
  const getAllMarkers = useCallback(() => {
    const allMarkers = [...markersRef.current];
    if (showUserLocation && currentLocation) {
      // Add user location as a marker if it doesn't already exist
      const userMarkerExists = allMarkers.some(
        marker => marker.type === 'driver' && 
        marker.latitude === currentLocation.latitude && 
        marker.longitude === currentLocation.longitude
      );
      
      if (!userMarkerExists) {
        allMarkers.push({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          title: 'Your Location',
          type: 'driver'
        });
      }
    }
    return allMarkers;
  }, [currentLocation, showUserLocation]);
  
  // Platform-specific optimizations
  const getPlatformOptimizations = useCallback(() => {
    const isNative = Platform.isNative();
    
    // Optimize for battery
    let optimizations: any = {};
    
    if (isNative) {
      // Native platform optimizations
      optimizations = {
        liteMode: lowPerformanceMode,
        preferNativeRendering: true,
        trafficEnabled: false,
        navigationControlsEnabled: enableControls,
      };
    } else {
      // Web platform optimizations
      optimizations = {
        optimizedResize: true,
        disablePointsOfInterest: true,
        disableStreetView: true,
        disableRotateControl: true,
        disableScrollZoom: lowPerformanceMode,
        restrictMapBounds: lowPerformanceMode
      };
    }
    
    return optimizations;
  }, [lowPerformanceMode, enableControls]);
  
  // Debounced refresh function for performance
  const refreshMap = useCallback(debounce(async () => {
    if (!mapInstance) return;
    
    try {
      // Update markers when data changes
      // This is a simplified version; in a real implementation, 
      // you would track which markers need to be added/updated/removed
    } catch (error) {
      console.error('Error refreshing map:', error);
    }
  }, 500), [mapInstance]);
  
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
          markers: getAllMarkers(),
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
        
        // Add map click listener if needed
        if (onMapClick) {
          mapClickListenerId.current = addMapClickListener(id, (event) => {
            onMapClick(event.latitude, event.longitude);
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
  }, [mapId, isMapLoading, isLocationLoading]); // Limited dependencies to prevent recreating the map
  
  return (
    <Card className={`overflow-hidden ${className} ${height} ${width}`}>
      {(isInitializing || isMapLoading || isLocationLoading) && (
        <Skeleton className="w-full h-full" />
      )}
      <div 
        id={mapId} 
        className={`w-full h-full ${lowPerformanceMode ? 'opacity-90' : ''}`} 
        aria-label="Map" 
        role="application"
      />
    </Card>
  );
};

export default StandardMap;
