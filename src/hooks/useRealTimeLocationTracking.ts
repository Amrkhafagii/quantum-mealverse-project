
import { useState, useEffect, useCallback } from 'react';
import { batteryOptimizedLocationService } from '@/services/location/BatteryOptimizedLocationService';
import { geofenceService } from '@/services/geofencing/GeofenceService';
import { customerNotificationService } from '@/services/notifications/CustomerNotificationService';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface LocationTrackingState {
  isTracking: boolean;
  batteryLevel: number;
  lastLocation: GeolocationPosition | null;
  activeGeofences: number;
  error: string | null;
}

export function useRealTimeLocationTracking(assignmentId?: string) {
  const { user } = useAuth();
  const { deliveryUser } = useDeliveryUser(user?.id);
  
  const [state, setState] = useState<LocationTrackingState>({
    isTracking: false,
    batteryLevel: 100,
    lastLocation: null,
    activeGeofences: 0,
    error: null
  });

  const startTracking = useCallback(async () => {
    if (!deliveryUser?.id || !assignmentId) {
      setState(prev => ({ ...prev, error: 'Missing delivery user or assignment ID' }));
      return false;
    }

    try {
      // Initialize geofencing service
      await geofenceService.initialize(deliveryUser.id, assignmentId);
      
      // Start battery optimized location tracking
      const success = await batteryOptimizedLocationService.startTracking(deliveryUser.id, assignmentId);
      
      if (success) {
        setState(prev => ({ 
          ...prev, 
          isTracking: true, 
          error: null,
          activeGeofences: geofenceService.getActiveZones().length
        }));
        
        toast({
          title: "Location Tracking Started",
          description: "Real-time location tracking is now active with battery optimization.",
        });
        
        return true;
      } else {
        setState(prev => ({ ...prev, error: 'Failed to start location tracking' }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      toast({
        title: "Location Tracking Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    }
  }, [deliveryUser?.id, assignmentId]);

  const stopTracking = useCallback(async () => {
    try {
      await batteryOptimizedLocationService.stopTracking();
      geofenceService.cleanup();
      
      setState(prev => ({ 
        ...prev, 
        isTracking: false,
        activeGeofences: 0
      }));
      
      toast({
        title: "Location Tracking Stopped",
        description: "Location tracking has been disabled.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  // Monitor battery level and location updates
  useEffect(() => {
    if (!state.isTracking) return;

    const interval = setInterval(() => {
      const batteryLevel = batteryOptimizedLocationService.getCurrentBatteryLevel();
      const lastLocation = batteryOptimizedLocationService.getLastLocation();
      
      setState(prev => ({
        ...prev,
        batteryLevel,
        lastLocation
      }));

      // Check geofences if we have a new location
      if (lastLocation) {
        geofenceService.checkGeofences(
          lastLocation.coords.latitude,
          lastLocation.coords.longitude,
          lastLocation.coords.accuracy
        );
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [state.isTracking]);

  // Auto-start tracking when assignment is available
  useEffect(() => {
    if (assignmentId && deliveryUser?.id && !state.isTracking && !state.error) {
      startTracking();
    }
  }, [assignmentId, deliveryUser?.id, state.isTracking, state.error, startTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.isTracking) {
        batteryOptimizedLocationService.stopTracking();
        geofenceService.cleanup();
      }
    };
  }, [state.isTracking]);

  return {
    ...state,
    startTracking,
    stopTracking,
    isLocationServiceActive: batteryOptimizedLocationService.isCurrentlyTracking()
  };
}
