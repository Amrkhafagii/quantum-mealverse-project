
import React, { useState, useEffect, useCallback } from 'react';
import UnifiedMapView from './UnifiedMapView';

interface OptimizedRouteMapProps {
  mapId: string;
  height?: string;
  className?: string;
  waypoints?: {
    latitude: number;
    longitude: number;
    title?: string;
    type?: string;
  }[];
  routeCoordinates?: {
    latitude: number;
    longitude: number;
  }[];
  isInteractive?: boolean;
}

const OptimizedRouteMap: React.FC<OptimizedRouteMapProps> = ({
  mapId,
  height = 'h-[400px]',
  className = '',
  waypoints = [],
  routeCoordinates = [],
  isInteractive = true
}) => {
  const [markers, setMarkers] = useState<any[]>([]);
  
  // Convert waypoints and routes to markers
  const processWaypoints = useCallback(() => {
    const newMarkers = [];
    
    // Add waypoint markers
    for (let i = 0; i < waypoints.length; i++) {
      const waypoint = waypoints[i];
      
      // Determine marker type and description based on position in array
      let type = waypoint.type || 'default';
      let description = '';
      
      if (i === 0) {
        type = waypoint.type || 'restaurant';
        description = 'Pickup';
      } else if (i === waypoints.length - 1) {
        type = waypoint.type || 'customer';
        description = 'Delivery';
      } else {
        description = `Stop ${i}`;
      }
      
      newMarkers.push({
        latitude: waypoint.latitude,
        longitude: waypoint.longitude,
        title: waypoint.title || description,
        description: description,
        type: type
      });
    }
    
    // Add route points as invisible markers (we can't draw polylines in UnifiedMapView yet)
    // This is a temporary solution until proper polyline support is added
    if (routeCoordinates && routeCoordinates.length > 0) {
      // Only add selected route points to avoid overcrowding the map
      // e.g., every 5th point for a simplified route representation
      for (let i = 0; i < routeCoordinates.length; i += 5) {
        const point = routeCoordinates[i];
        
        // Skip adding route markers in current implementation
        // We'll implement proper route display in future updates
      }
    }
    
    setMarkers(newMarkers);
  }, [waypoints, routeCoordinates]);
  
  // Process waypoints when they change
  useEffect(() => {
    processWaypoints();
  }, [processWaypoints]);
  
  return (
    <UnifiedMapView
      mapId={mapId}
      height={height}
      additionalMarkers={markers}
      showHeader={false}
      isInteractive={isInteractive}
    />
  );
};

export default OptimizedRouteMap;
