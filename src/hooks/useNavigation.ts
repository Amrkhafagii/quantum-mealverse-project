
import { useState, useEffect, useCallback } from 'react';
import { navigationService, NavigationSession, NavigationUpdate } from '@/services/navigation/NavigationService';
import { googleRoutingService, CalculatedRoute } from '@/services/routing/GoogleRoutingService';
import { toast } from '@/hooks/use-toast';

interface UseNavigationOptions {
  assignmentId?: string;
  deliveryUserId?: string;
  onNavigationUpdate?: (update: NavigationUpdate) => void;
  onRouteComplete?: () => void;
}

export function useNavigation(options: UseNavigationOptions = {}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentSession, setCurrentSession] = useState<NavigationSession | null>(null);
  const [navigationUpdate, setNavigationUpdate] = useState<NavigationUpdate | null>(null);
  const [currentRoute, setCurrentRoute] = useState<CalculatedRoute | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start navigation with route calculation
  const startNavigation = useCallback(async (
    origin: { latitude: number; longitude: number; name?: string },
    destination: { latitude: number; longitude: number; name?: string },
    waypoints: Array<{ latitude: number; longitude: number; name?: string }> = []
  ) => {
    if (!options.assignmentId || !options.deliveryUserId) {
      throw new Error('Assignment ID and Delivery User ID are required');
    }

    try {
      setIsCalculatingRoute(true);
      setError(null);

      // Calculate optimized route
      const route = await googleRoutingService.calculateOptimizedRoute(
        origin,
        destination,
        waypoints,
        options.assignmentId
      );

      setCurrentRoute(route);

      // Start navigation session
      const session = await navigationService.startNavigation(
        route.id,
        options.deliveryUserId,
        options.assignmentId
      );

      setCurrentSession(session);
      setIsNavigating(true);

      toast({
        title: "Navigation Started",
        description: "Turn-by-turn navigation is now active",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start navigation';
      setError(errorMessage);
      
      toast({
        title: "Navigation Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [options.assignmentId, options.deliveryUserId]);

  // Stop navigation
  const stopNavigation = useCallback(async () => {
    try {
      await navigationService.stopNavigation();
      setIsNavigating(false);
      setCurrentSession(null);
      setNavigationUpdate(null);
      setCurrentRoute(null);
      setError(null);

      toast({
        title: "Navigation Stopped",
        description: "Navigation has been ended",
      });
    } catch (err) {
      console.error('Error stopping navigation:', err);
    }
  }, []);

  // Update current location
  const updateLocation = useCallback(async (latitude: number, longitude: number) => {
    if (!isNavigating) return;

    try {
      const update = await navigationService.updateLocation(latitude, longitude);
      
      if (update) {
        setNavigationUpdate(update);
        
        if (options.onNavigationUpdate) {
          options.onNavigationUpdate(update);
        }

        // Check if route is complete
        if (update.progress.percentComplete >= 100) {
          await stopNavigation();
          if (options.onRouteComplete) {
            options.onRouteComplete();
          }
        }
      }
    } catch (err) {
      console.error('Error updating location:', err);
    }
  }, [isNavigating, options, stopNavigation]);

  // Calculate route without starting navigation
  const calculateRoute = useCallback(async (
    origin: { latitude: number; longitude: number; name?: string },
    destination: { latitude: number; longitude: number; name?: string },
    waypoints: Array<{ latitude: number; longitude: number; name?: string }> = []
  ) => {
    if (!options.assignmentId) {
      throw new Error('Assignment ID is required');
    }

    try {
      setIsCalculatingRoute(true);
      setError(null);

      const route = await googleRoutingService.calculateOptimizedRoute(
        origin,
        destination,
        waypoints,
        options.assignmentId
      );

      setCurrentRoute(route);
      return route;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate route';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [options.assignmentId]);

  // Get current ETA
  const getCurrentETA = useCallback(async (currentLocation: { latitude: number; longitude: number }) => {
    if (!currentRoute) return null;

    try {
      return await googleRoutingService.calculateETA(currentRoute.id, currentLocation);
    } catch (err) {
      console.error('Error calculating ETA:', err);
      return null;
    }
  }, [currentRoute]);

  // Monitor for active session on mount
  useEffect(() => {
    const activeSession = navigationService.getActiveSession();
    if (activeSession) {
      setCurrentSession(activeSession);
      setIsNavigating(true);
    }
  }, []);

  // Auto-update location when navigating
  useEffect(() => {
    if (!isNavigating) return;

    const watchId = navigator.geolocation?.watchPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation?.clearWatch(watchId);
      }
    };
  }, [isNavigating, updateLocation]);

  return {
    // State
    isNavigating,
    isCalculatingRoute,
    currentSession,
    navigationUpdate,
    currentRoute,
    error,

    // Actions
    startNavigation,
    stopNavigation,
    updateLocation,
    calculateRoute,
    getCurrentETA
  };
}
