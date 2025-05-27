
import { useState, useCallback } from 'react';
import { googleRoutingService, CalculatedRoute, RouteWaypoint } from '@/services/routing/GoogleRoutingService';
import { Platform } from '@/utils/platform';
import { toast } from '@/hooks/use-toast';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { hapticFeedback } from '@/utils/hapticFeedback';

interface UseRouteOptimizationOptions {
  onRouteCalculated?: (route: CalculatedRoute) => void;
  onError?: (error: Error) => void;
  assignmentId?: string;
}

export function useRouteOptimization(options?: UseRouteOptimizationOptions) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<CalculatedRoute | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useConnectionStatus();

  const calculateOptimalRoute = useCallback(async (
    origin: RouteWaypoint,
    destination: RouteWaypoint,
    waypoints: RouteWaypoint[] = []
  ) => {
    if (!isOnline) {
      const offlineError = new Error('Cannot calculate routes while offline');
      setError(offlineError);
      if (options?.onError) options.onError(offlineError);
      toast({
        title: "Offline Mode",
        description: "Route optimization is unavailable while offline",
        variant: "destructive"
      });
      return null;
    }

    if (!options?.assignmentId) {
      const noAssignmentError = new Error('Assignment ID is required for route calculation');
      setError(noAssignmentError);
      if (options?.onError) options.onError(noAssignmentError);
      return null;
    }

    try {
      setIsCalculating(true);
      setError(null);
      
      // Provide haptic feedback when starting route calculation
      await hapticFeedback.light();
      
      const result = await googleRoutingService.calculateOptimizedRoute(
        origin,
        destination,
        waypoints,
        options.assignmentId
      );
      
      setCurrentRoute(result);
      setIsCalculating(false);
      
      // Provide success haptic feedback
      await hapticFeedback.success();
      
      if (options?.onRouteCalculated) {
        options.onRouteCalculated(result);
      }
      
      toast({
        title: "Route Calculated",
        description: `Optimized route: ${(result.total_distance / 1000).toFixed(1)}km, ${Math.round(result.total_duration / 60)}min`,
      });
      
      return result;
    } catch (err) {
      console.error('Error calculating route:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsCalculating(false);
      
      // Provide error haptic feedback
      await hapticFeedback.error();
      
      if (options?.onError) {
        options.onError(err instanceof Error ? err : new Error(String(err)));
      }
      
      toast({
        title: "Route Calculation Failed",
        description: "Could not calculate the optimal route",
        variant: "destructive"
      });
      
      return null;
    }
  }, [isOnline, options]);

  const calculateMultiStopRoute = useCallback(async (
    stops: RouteWaypoint[]
  ) => {
    if (stops.length < 2) {
      const error = new Error('At least 2 stops are required for route calculation');
      setError(error);
      if (options?.onError) options.onError(error);
      return null;
    }

    const origin = stops[0];
    const destination = stops[stops.length - 1];
    const waypoints = stops.slice(1, -1);

    return await calculateOptimalRoute(origin, destination, waypoints);
  }, [calculateOptimalRoute]);

  const getTrafficIncidents = useCallback(async () => {
    if (!currentRoute) return [];

    try {
      return await googleRoutingService.getTrafficIncidents(currentRoute.id);
    } catch (err) {
      console.error('Error fetching traffic incidents:', err);
      return [];
    }
  }, [currentRoute]);

  const calculateETA = useCallback(async (currentLocation: { latitude: number; longitude: number }) => {
    if (!currentRoute) return null;

    try {
      return await googleRoutingService.calculateETA(currentRoute.id, currentLocation);
    } catch (err) {
      console.error('Error calculating ETA:', err);
      return null;
    }
  }, [currentRoute]);

  return {
    calculateOptimalRoute,
    calculateMultiStopRoute,
    getTrafficIncidents,
    calculateETA,
    isCalculating,
    currentRoute,
    error
  };
}
