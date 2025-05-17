
import React, { useState, useEffect } from 'react';
import { useDeliveryAssignments } from '@/hooks/useDeliveryAssignments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoutePoint } from '@/plugins/RouteOptimizationPlugin';
import OptimizedRouteMap from '@/components/maps/OptimizedRouteMap';
import { Button } from '@/components/ui/button';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin, RotateCw, Route } from 'lucide-react';
import { HapticButton } from '@/components/ui/haptic-button';

interface OptimizedDeliveryRoutesProps {
  className?: string;
  returnToRestaurant?: boolean;
}

export const OptimizedDeliveryRoutes: React.FC<OptimizedDeliveryRoutesProps> = ({ 
  className = '',
  returnToRestaurant = false
}) => {
  const { activeAssignments } = useDeliveryAssignments();
  const [returnToOrigin, setReturnToOrigin] = useState(returnToRestaurant);
  const [stops, setStops] = useState<RoutePoint[]>([]);
  const locationPermission = useLocationPermission();
  const { toast } = useToast();
  
  // Prepare stops from current location and active assignments
  useEffect(() => {
    const newStops: RoutePoint[] = [];
    
    // Add current location as the starting point
    if (locationPermission.location) {
      newStops.push({
        latitude: locationPermission.location.coords.latitude,
        longitude: locationPermission.location.coords.longitude,
        name: 'Current Location',
        stopType: 'pickup'
      });
    }
    
    // Add all restaurant pickup locations
    activeAssignments.forEach(assignment => {
      if (assignment.status === 'assigned' && assignment.restaurant) {
        newStops.push({
          latitude: assignment.restaurant.latitude,
          longitude: assignment.restaurant.longitude,
          name: `Pickup: ${assignment.restaurant.name}`,
          stopType: 'pickup'
        });
      }
    });
    
    // Add all delivery locations
    activeAssignments.forEach(assignment => {
      if (assignment.latitude && assignment.longitude) {
        newStops.push({
          latitude: assignment.latitude,
          longitude: assignment.longitude,
          name: `Delivery: Order #${assignment.order_id.substring(0, 6)}`,
          stopType: 'delivery'
        });
      }
    });
    
    // If we want to return to origin and we have current location
    if (returnToOrigin && locationPermission.location && newStops.length > 0) {
      newStops.push({
        latitude: locationPermission.location.coords.latitude,
        longitude: locationPermission.location.coords.longitude,
        name: 'Return to Start',
        stopType: 'waypoint'
      });
    }
    
    setStops(newStops);
  }, [activeAssignments, locationPermission.location, returnToOrigin]);

  const handleRouteCalculated = (route: any) => {
    toast({
      title: "Route Optimized",
      description: `Found the fastest route between ${stops.length} locations`,
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Route className="mr-2 h-5 w-5" />
            Optimized Delivery Routes
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="return-switch" className="text-xs cursor-pointer">
              Return to start
            </Label>
            <Switch
              id="return-switch"
              checked={returnToOrigin}
              onCheckedChange={setReturnToOrigin}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!locationPermission.location ? (
          <div className="py-8 text-center">
            <MapPin className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Location permission required</p>
            <HapticButton 
              onClick={() => locationPermission.requestPermission()} 
              className="mt-4"
              hapticEffect="selection"
            >
              Enable Location
            </HapticButton>
          </div>
        ) : stops.length < 2 ? (
          <div className="py-8 text-center">
            <Route className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No deliveries to optimize</p>
            <p className="text-xs text-muted-foreground mt-1">
              Accept deliveries to calculate optimal routes
            </p>
          </div>
        ) : (
          <OptimizedRouteMap
            stops={stops}
            returnToOrigin={returnToOrigin}
            onRouteCalculated={handleRouteCalculated}
            height="h-[350px]"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default OptimizedDeliveryRoutes;
