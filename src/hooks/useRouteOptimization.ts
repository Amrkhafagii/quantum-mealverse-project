
import { useState, useCallback } from 'react';
import RouteOptimization, { RoutePoint, RouteOptions, OptimizedRoute } from '@/plugins/RouteOptimizationPlugin';
import { Platform } from '@/utils/platform';
import { toast } from '@/hooks/use-toast';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { hapticFeedback } from '@/utils/hapticFeedback';

interface UseRouteOptimizationOptions {
  onRouteCalculated?: (route: OptimizedRoute) => void;
  onError?: (error: Error) => void;
  stopOptimization?: 'distance' | 'duration';
}

export function useRouteOptimization(options?: UseRouteOptimizationOptions) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<OptimizedRoute | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useConnectionStatus();

  const calculateOptimalRoute = useCallback(async (
    origin: RoutePoint,
    destination: RoutePoint,
    waypoints: RoutePoint[] = [],
    routeOptions: RouteOptions = { optimizeWaypoints: true }
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

    try {
      setIsCalculating(true);
      setError(null);
      
      // Provide haptic feedback when starting route calculation
      await hapticFeedback.light();
      
      // Add the stopOptimization strategy if specified in hook options
      if (options?.stopOptimization && !routeOptions.stopOptimization) {
        routeOptions = {
          ...routeOptions,
          stopOptimization: options.stopOptimization
        };
      }
      
      // If not on a native platform, fall back to web API
      if (!Platform.isNative()) {
        // Fall back to existing web implementation
        console.log('Using web fallback for route calculation');
        // For this example, we'll just simulate a response
        setTimeout(() => {
          setIsCalculating(false);
          // Simulate route calculation
        }, 1500);
        return null;
      }
      
      const result = await RouteOptimization.calculateOptimalRoute({
        origin,
        destination,
        waypoints,
        options: routeOptions
      });
      
      setCurrentRoute(result.route);
      setIsCalculating(false);
      
      // Provide success haptic feedback
      await hapticFeedback.success();
      
      if (options?.onRouteCalculated) {
        options.onRouteCalculated(result.route);
      }
      
      return result.route;
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
    stops: RoutePoint[],
    returnToOrigin: boolean = false,
    routeOptions: RouteOptions = { optimizeWaypoints: true }
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

    if (stops.length < 2) {
      const error = new Error('At least 2 stops are required for route calculation');
      setError(error);
      if (options?.onError) options.onError(error);
      return null;
    }

    try {
      setIsCalculating(true);
      setError(null);
      
      // Provide haptic feedback when starting route calculation
      await hapticFeedback.medium();
      
      // Add the stopOptimization strategy if specified in hook options
      if (options?.stopOptimization && !routeOptions.stopOptimization) {
        routeOptions = {
          ...routeOptions,
          stopOptimization: options.stopOptimization
        };
      }
      
      // If not on a native platform, fall back to web API
      if (!Platform.isNative()) {
        // Fall back to existing web implementation
        console.log('Using web fallback for multi-stop route calculation');
        // For this example, we'll just simulate a response
        setTimeout(() => {
          setIsCalculating(false);
          // Simulate route calculation
        }, 2000);
        return null;
      }
      
      const result = await RouteOptimization.calculateMultiStopRoute({
        stops,
        returnToOrigin,
        options: routeOptions
      });
      
      setCurrentRoute(result.route);
      setIsCalculating(false);
      
      // Provide success haptic feedback
      await hapticFeedback.success();
      
      if (options?.onRouteCalculated) {
        options.onRouteCalculated(result.route);
      }
      
      return result.route;
    } catch (err) {
      console.error('Error calculating multi-stop route:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsCalculating(false);
      
      // Provide error haptic feedback
      await hapticFeedback.error();
      
      if (options?.onError) {
        options.onError(err instanceof Error ? err : new Error(String(err)));
      }
      
      toast({
        title: "Route Calculation Failed",
        description: "Could not calculate the multi-stop route",
        variant: "destructive"
      });
      
      return null;
    }
  }, [isOnline, options]);

  const cancelCalculation = useCallback(async () => {
    if (!Platform.isNative()) {
      // Handle web fallback cancellation
      setIsCalculating(false);
      return;
    }
    
    try {
      await RouteOptimization.cancelRouteCalculation();
      setIsCalculating(false);
    } catch (err) {
      console.error('Error cancelling route calculation:', err);
    }
  }, []);

  return {
    calculateOptimalRoute,
    calculateMultiStopRoute,
    cancelCalculation,
    isCalculating,
    currentRoute,
    error
  };
}
