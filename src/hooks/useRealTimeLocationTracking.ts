
import { useState, useEffect, useCallback } from 'react';
import { batteryOptimizedLocationService } from '@/services/location/BatteryOptimizedLocationService';
import { customerNotificationService } from '@/services/notifications/CustomerNotificationService';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface LocationTrackingState {
  isTracking: boolean;
  batteryLevel: number;
  lastLocation: GeolocationPosition | null;
  error: string | null;
}

export function useRealTimeLocationTracking(assignmentId?: string) {
  const { user } = useAuth();
  const { deliveryUser } = useDeliveryUser(user?.id);
  
  const [state, setState] = useState<LocationTrackingState>({
    isTracking: false,
    batteryLevel: 100,
    lastLocation: null,
    error: null
  });

  const startTracking = useCallback(async () => {
    if (!deliveryUser?.id || !assignmentId) {
      setState(prev => ({ ...prev, error: 'Missing delivery user or assignment ID' }));
      return false;
    }

    try {
      // Start battery optimized location tracking
      const success = await batteryOptimizedLocationService.startTracking(deliveryUser.id, assignmentId);
      
      if (success) {
        setState(prev => ({ 
          ...prev, 
          isTracking: true, 
          error: null
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
      
      setState(prev => ({ 
        ...prev, 
        isTracking: false
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
