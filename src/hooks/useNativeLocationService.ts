
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/components/ui/use-toast';
import { DeliveryLocation } from '@/types/location';
import { useLocationPermissions } from './useLocationPermissions';
import { useCurrentLocation } from './useCurrentLocation';
import { useBackgroundLocationTracking } from './useBackgroundLocationTracking';
import { useForegroundLocationTracking } from './useForegroundLocationTracking';

export const useNativeLocationService = (options: {
  backgroundTracking?: boolean;
  trackingInterval?: number;
}) => {
  const {
    backgroundTracking = false,
    trackingInterval = 10000, // 10 seconds default
  } = options;
  
  const [location, setLocation] = useState<DeliveryLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Use the smaller hooks
  const { permissionStatus, requestPermissions } = useLocationPermissions();
  const { getCurrentLocation } = useCurrentLocation();
  const { startBackgroundTracking, stopBackgroundTracking, isBackgroundTracking } = useBackgroundLocationTracking({
    onLocationUpdate: (newLocation) => {
      setLocation(newLocation);
      setLastUpdated(new Date());
    }
  });
  const { startForegroundTracking, stopForegroundTracking, isForegroundTracking } = useForegroundLocationTracking({
    onLocationUpdate: (newLocation) => {
      setLocation(newLocation);
      setLastUpdated(new Date());
    }
  });

  // Update tracking state when either type of tracking changes
  useEffect(() => {
    setIsTracking(isBackgroundTracking || isForegroundTracking);
  }, [isBackgroundTracking, isForegroundTracking]);
  
  // Get current location with permission handling
  const getCurrentLocationWithPermission = useCallback(async (): Promise<DeliveryLocation | null> => {
    try {
      if (permissionStatus !== 'granted') {
        const granted = await requestPermissions();
        if (!granted) {
          setError('Location permission not granted');
          return null;
        }
      }
      
      const locationData = await getCurrentLocation();
      
      if (locationData) {
        setLocation(locationData);
        setLastUpdated(new Date());
        setError(null);
      }
      
      return locationData;
    } catch (err) {
      console.error('Error getting current location', err);
      setError('Failed to get location');
      return null;
    }
  }, [permissionStatus, requestPermissions, getCurrentLocation]);

  // Start tracking location with appropriate method based on platform and settings
  const startTracking = useCallback(async () => {
    if (permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) {
        setError('Location permission not granted');
        return false;
      }
    }
    
    try {
      let success = false;
      
      // If we're on a native platform and background tracking is enabled
      if (Capacitor.isNativePlatform() && backgroundTracking) {
        success = await startBackgroundTracking();
      } else {
        success = await startForegroundTracking();
      }
      
      if (success) {
        setError(null);
        
        // Get an initial location
        await getCurrentLocationWithPermission();
      }
      
      return success;
    } catch (err) {
      console.error('Error starting location tracking', err);
      setError('Failed to start location tracking');
      
      toast({
        title: "Location tracking failed",
        description: "Could not start tracking your location. Please check your settings.",
        variant: "destructive"
      });
      
      return false;
    }
  }, [
    permissionStatus, 
    requestPermissions, 
    backgroundTracking, 
    startBackgroundTracking, 
    startForegroundTracking, 
    getCurrentLocationWithPermission
  ]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    try {
      let success = true;
      
      if (Capacitor.isNativePlatform() && backgroundTracking) {
        success = await stopBackgroundTracking();
      } else {
        success = await stopForegroundTracking();
      }
      
      return success;
    } catch (err) {
      console.error('Error stopping location tracking', err);
      return false;
    }
  }, [backgroundTracking, stopBackgroundTracking, stopForegroundTracking]);

  return {
    location,
    error,
    isTracking,
    permissionStatus,
    lastUpdated,
    getCurrentLocation: getCurrentLocationWithPermission,
    startTracking,
    stopTracking,
    requestPermissions
  };
};
