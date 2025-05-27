
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouteOptimization } from '@/hooks/useRouteOptimization';
import { useDeliveryAssignments } from '@/hooks/useDeliveryAssignments';
import { useAuth } from '@/hooks/useAuth';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Route, MapPin, Clock, Truck, Navigation } from 'lucide-react';
import OptimizedRouteMap from '@/components/maps/OptimizedRouteMap';

export const OptimizedDeliveryRoutes: React.FC = () => {
  const { user } = useAuth();
  const { deliveryUser } = useDeliveryUser(user?.id);
  const { activeAssignments } = useDeliveryAssignments(deliveryUser?.id);
  const { location } = useLocationPermission();
  
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [routeStops, setRouteStops] = useState<any[]>([]);

  const {
    calculateMultiStopRoute,
    isCalculating,
    currentRoute,
    error
  } = useRouteOptimization({
    assignmentId: selectedAssignments[0],
    onRouteCalculated: (route) => {
      console.log('Route calculated:', route);
    }
  });

  // Update route stops when assignments or location change
  useEffect(() => {
    if (!location || selectedAssignments.length === 0) {
      setRouteStops([]);
      return;
    }

    const stops = [];
    
    // Start from current location
    stops.push({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      name: 'Your Location',
      stopType: 'waypoint'
    });

    // Add selected assignments
    selectedAssignments.forEach(assignmentId => {
      const assignment = activeAssignments.find(a => a.id === assignmentId);
      if (!assignment) return;

      // Add restaurant pickup if not picked up
      if (assignment.status === 'assigned' && assignment.restaurant) {
        stops.push({
          latitude: assignment.restaurant.latitude,
          longitude: assignment.restaurant.longitude,
          name: assignment.restaurant.name,
          stopType: 'pickup'
        });
      }

      // Add delivery location
      stops.push({
        latitude: assignment.latitude,
        longitude: assignment.longitude,
        name: assignment.customer?.name || 'Customer',
        stopType: 'delivery'
      });
    });

    setRouteStops(stops);
  }, [location, selectedAssignments, activeAssignments]);

  const handleAssignmentToggle = (assignmentId: string) => {
    setSelectedAssignments(prev => 
      prev.includes(assignmentId)
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  const handleOptimizeRoute = async () => {
    if (routeStops.length < 2) return;

    await calculateMultiStopRoute(routeStops);
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <div className="space-y-6">
      {/* Assignment Selection */}
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-quantum-cyan" />
            Select Deliveries to Optimize
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAssignments.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No active assignments available
            </div>
          ) : (
            <div className="space-y-2">
              {activeAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAssignments.includes(assignment.id)
                      ? 'bg-quantum-cyan/20 border-quantum-cyan'
                      : 'bg-quantum-darkBlue/30 border-transparent hover:border-quantum-cyan/50'
                  }`}
                  onClick={() => handleAssignmentToggle(assignment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {assignment.restaurant?.name || 'Restaurant'}
                      </div>
                      <div className="text-sm text-gray-400">
                        to {assignment.customer?.name || 'Customer'}
                      </div>
                    </div>
                    <Badge variant={assignment.status === 'assigned' ? 'default' : 'secondary'}>
                      {assignment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Optimization */}
      {selectedAssignments.length > 0 && (
        <Card className="holographic-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-quantum-cyan" />
              Route Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Route Stops */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Route Stops ({routeStops.length})</h3>
              <div className="space-y-1">
                {routeStops.map((stop, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      stop.stopType === 'pickup' ? 'bg-blue-500' :
                      stop.stopType === 'delivery' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>{stop.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {stop.stopType}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Button */}
            <Button
              onClick={handleOptimizeRoute}
              className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
              disabled={isCalculating || routeStops.length < 2}
            >
              <Navigation className="h-4 w-4 mr-2" />
              {isCalculating ? 'Optimizing Route...' : 'Optimize Route'}
            </Button>

            {/* Route Results */}
            {currentRoute && (
              <div className="p-3 bg-quantum-darkBlue/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Optimized Route</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400">
                    Optimized
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Route className="h-3 w-3 text-gray-400" />
                    <span>Distance: {formatDistance(currentRoute.total_distance)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span>Duration: {formatDuration(currentRoute.total_duration)}</span>
                  </div>
                </div>

                {currentRoute.optimized_waypoint_order && (
                  <div className="text-xs text-gray-400">
                    Stops reordered for optimal efficiency
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="text-red-400 text-sm">{error.message}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Route Visualization */}
      {currentRoute && routeStops.length > 0 && (
        <Card className="holographic-card">
          <CardHeader>
            <CardTitle>Route Visualization</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <OptimizedRouteMap
              mapId="optimized-delivery-route"
              height="h-[400px]"
              stops={routeStops}
              onRouteCalculated={(route) => console.log('Map route calculated:', route)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
