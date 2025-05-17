
import React, { useState, useEffect, useCallback } from 'react';
import { useRouteOptimization } from '@/hooks/useRouteOptimization';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, RotateCw, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { RoutePoint, OptimizedRoute } from '@/plugins/RouteOptimizationPlugin';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { Platform } from '@/utils/platform';
import UnifiedMapView from '@/components/maps/UnifiedMapView';
import { HapticButton } from '@/components/ui/haptic-button';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';

interface OptimizedRouteMapProps {
  stops: RoutePoint[];
  returnToOrigin?: boolean;
  className?: string;
  onRouteCalculated?: (route: OptimizedRoute) => void;
  showControls?: boolean;
  height?: string;
}

const OptimizedRouteMap: React.FC<OptimizedRouteMapProps> = ({
  stops,
  returnToOrigin = false,
  className = '',
  onRouteCalculated,
  showControls = true,
  height = 'h-[400px]'
}) => {
  const [locations, setLocations] = useState<RoutePoint[]>([]);
  const { isLowQuality } = useNetworkQuality();
  const { 
    calculateMultiStopRoute, 
    cancelCalculation, 
    isCalculating, 
    currentRoute, 
    error 
  } = useRouteOptimization({
    onRouteCalculated
  });
  
  // Prepare locations for the map
  useEffect(() => {
    setLocations(stops);
  }, [stops]);
  
  // Calculate the route when stops change
  useEffect(() => {
    if (stops.length >= 2) {
      calculateMultiStopRoute(stops, returnToOrigin);
    }
  }, [stops, returnToOrigin, calculateMultiStopRoute]);
  
  // Format the optimized route for display
  const formatRouteInfo = useCallback((route: OptimizedRoute | null) => {
    if (!route) return null;
    
    const totalDistance = route.distance;
    const totalDuration = route.duration;
    
    // Format distance in km if > 1000m
    const formattedDistance = totalDistance >= 1000 
      ? `${(totalDistance / 1000).toFixed(1)} km` 
      : `${totalDistance.toFixed(0)} m`;
      
    // Format duration in hours if > 60 min
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    
    const formattedDuration = hours > 0 
      ? `${hours} hr ${minutes} min` 
      : `${minutes} min`;
      
    return { formattedDistance, formattedDuration };
  }, []);
  
  const routeInfo = formatRouteInfo(currentRoute);
  
  // Convert locations for map display
  const mapLocations = locations.map((location, index) => ({
    latitude: location.latitude,
    longitude: location.longitude,
    title: location.name || `Stop ${index + 1}`,
    description: location.stopType || (index === 0 ? 'Start' : index === locations.length - 1 ? 'End' : 'Waypoint'),
    type: location.stopType === 'pickup' ? 'restaurant' : 
          location.stopType === 'delivery' ? 'customer' : 
          index === 0 ? 'driver' : 'generic'
  }));

  return (
    <div className={`${className}`}>
      {showControls && (
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-sm font-medium">Optimized Route</h3>
            {routeInfo && !isCalculating && (
              <p className="text-xs text-muted-foreground">
                {routeInfo.formattedDistance} • {routeInfo.formattedDuration}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isCalculating ? (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  hapticFeedback.light();
                  cancelCalculation();
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            ) : (
              <HapticButton
                size="sm"
                variant="outline"
                onClick={() => calculateMultiStopRoute(stops, returnToOrigin)}
                disabled={locations.length < 2}
                hapticEffect="medium"
              >
                <RotateCw className="h-4 w-4 mr-1" />
                Recalculate
              </HapticButton>
            )}
          </div>
        </div>
      )}
      
      {locations.length < 2 ? (
        <Card className={`flex items-center justify-center ${height}`}>
          <div className="text-center p-4">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">At least 2 stops are needed</p>
          </div>
        </Card>
      ) : (
        <div className="relative">
          <UnifiedMapView
            height={height}
            mapId="optimized-route-map"
            showRoute={true}
            additionalMarkers={mapLocations}
            showHeader={false}
            isInteractive={!isCalculating}
          />
          
          {isCalculating && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-background p-4 rounded-md shadow-lg text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium">Calculating optimal route...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Finding the fastest path between {locations.length} stops
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3" 
                  onClick={() => {
                    hapticFeedback.light();
                    cancelCalculation();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {error && !isCalculating && (
            <div className="absolute bottom-2 right-2 left-2 bg-destructive/90 text-destructive-foreground p-2 rounded text-sm">
              {error.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OptimizedRouteMap;
