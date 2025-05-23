
import React, { useState, useEffect, useCallback } from 'react';
import UnifiedMapView from './UnifiedMapView';

interface RoutePoint {
  latitude: number;
  longitude: number;
  title?: string;
  type?: string;
}

interface OptimizedRouteMapProps {
  mapId: string;
  height?: string;
  className?: string;
  waypoints?: Array<{
    latitude: number;
    longitude: number;
    title?: string;
    type?: string;
  }>;
  routeCoordinates?: Array<{
    latitude: number;
    longitude: number;
  }>;
  isInteractive?: boolean;
  // Add new props
  stops?: RoutePoint[];
  returnToOrigin?: boolean;
  onRouteCalculated?: (route: any) => void;
}

const OptimizedRouteMap: React.FC<OptimizedRouteMapProps> = ({
  mapId,
  height = 'h-[400px]',
  className = '',
  waypoints = [],
  routeCoordinates = [],
  isInteractive = true,
  stops = [],
  returnToOrigin = false,
  onRouteCalculated
}) => {
  const [markers, setMarkers] = useState<any[]>([]);
  
  // Convert waypoints and routes to markers
  const processWaypoints = useCallback(() => {
    const newMarkers = [];
    
    // First process waypoints from props
    if (waypoints.length > 0) {
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
    }
    
    // Then process stops from props (for OptimizedDeliveryRoutes component)
    if (stops.length > 0) {
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        
        // Determine marker type and description based on position in array
        let type = stop.type || 'default';
        let description = '';
        
        if (i === 0) {
          type = stop.type || 'restaurant';
          description = 'Pickup';
        } else if (i === stops.length - 1 && !returnToOrigin) {
          type = stop.type || 'customer';
          description = 'Delivery';
        } else {
          description = `Stop ${i}`;
        }
        
        newMarkers.push({
          latitude: stop.latitude,
          longitude: stop.longitude,
          title: stop.title || description,
          description: description,
          type: type
        });
      }
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
    
    // If route calculation is complete, notify parent
    if (onRouteCalculated && newMarkers.length > 0) {
      onRouteCalculated({
        markers: newMarkers,
        distance: calculateTotalDistance(newMarkers),
        duration: estimateRouteDuration(newMarkers)
      });
    }
    
  }, [waypoints, routeCoordinates, stops, returnToOrigin, onRouteCalculated]);
  
  // Calculate estimated total distance (simplified)
  const calculateTotalDistance = (points: any[]): number => {
    // Simple placeholder for distance calculation
    return points.length * 2.5; // km
  };
  
  // Estimate route duration (simplified)
  const estimateRouteDuration = (points: any[]): number => {
    // Simple placeholder for duration calculation
    return points.length * 10; // minutes
  };
  
  // Process waypoints when they change
  useEffect(() => {
    processWaypoints();
  }, [processWaypoints]);
  
  return (
    <UnifiedMapView
      mapId={mapId}
      height={height}
      className={className}
      additionalMarkers={markers}
      showHeader={false}
      isInteractive={isInteractive}
    />
  );
};

export default OptimizedRouteMap;
