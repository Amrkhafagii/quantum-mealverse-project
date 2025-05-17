
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { useToast } from '@/components/ui/use-toast';
import { useLocationPermissions } from '@/hooks/useLocationPermissions';
import { Platform } from '@/utils/platform';
import LocationPermissions from '@/plugins/LocationPermissionsPlugin';

interface LocationPermissionHookResponse {
  location: Position | null;
  permissionStatus: PermissionState;
  backgroundPermissionStatus: PermissionState;
  hasShownInitialPrompt: boolean;
  hasInitialized: boolean;
  isRequesting: boolean;
  requestPermission: () => Promise<boolean>;
  requestBackgroundPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Position | null>;
  isTracking: boolean;
  toggleTracking: () => Promise<boolean>;
  locationIsValid: () => boolean;
  isLocationStale: () => boolean;
}

export function useLocationPermission(): LocationPermissionHookResponse {
  const [location, setLocation] = useState<Position | null>(null);
  const [hasShownInitialPrompt, setHasShownInitialPrompt] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();
  
  // Use our enhanced permissions hook
  const {
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission: requestBasicPermission,
    requestBackgroundPermission: requestBgPermission,
    isRequesting
  } = useLocationPermissions();

  // Get current location if permission is granted
  const getCurrentLocation = useCallback(async (): Promise<Position | null> => {
    try {
      if (permissionStatus !== 'granted') {
        console.log('Location permission not granted');
        return null;
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      
      setLocation(position);
      localStorage.setItem('lastLocationTimestamp', new Date().toISOString());
      return position;
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: 'Location Error',
        description: 'Could not get your location. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  }, [permissionStatus, toast]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      // Check if there's a saved location in localStorage
      const lastLocationTimestamp = localStorage.getItem('lastLocationTimestamp');
      if (lastLocationTimestamp) {
        // If we have permission, update location
        if (permissionStatus === 'granted') {
          await getCurrentLocation();
        }
      }
      
      setHasInitialized(true);
    };
    
    init();
  }, [permissionStatus, getCurrentLocation]);

  // Request permission wrapper
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setHasShownInitialPrompt(true);
    
    try {
      const granted = await requestBasicPermission();
      
      if (granted) {
        await getCurrentLocation();
        
        // Save permission status
        localStorage.setItem('locationPermission', 'granted');
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }, [requestBasicPermission, getCurrentLocation]);

  // Request background permission wrapper
  const requestBackgroundPermission = useCallback(async (): Promise<boolean> => {
    if (!Platform.isAndroid()) return true;
    
    setHasShownInitialPrompt(true);
    
    try {
      const granted = await requestBgPermission();
      
      if (granted) {
        // Save background permission status
        localStorage.setItem('backgroundLocationPermission', 'granted');
        
        // Start foreground service on Android
        if (Platform.isNative() && Platform.isAndroid()) {
          // Trigger foreground service on native Android
          const event = new CustomEvent('startLocationService');
          document.dispatchEvent(event);
        }
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting background location permission:', error);
      return false;
    }
  }, [requestBgPermission]);

  // Toggle tracking state
  const toggleTracking = useCallback(async (): Promise<boolean> => {
    if (isTracking) {
      setIsTracking(false);
      return true;
    } else {
      if (permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return false;
      }
      
      setIsTracking(true);
      
      // If on Android and background permission not granted, request it
      if (Platform.isAndroid() && backgroundPermissionStatus !== 'granted') {
        requestBackgroundPermission();
      }
      
      await getCurrentLocation();
      return true;
    }
  }, [isTracking, permissionStatus, backgroundPermissionStatus, requestPermission, requestBackgroundPermission, getCurrentLocation]);

  // Check if location is valid
  const locationIsValid = useCallback(() => {
    return !!(location && 
      location.coords && 
      location.coords.latitude && 
      location.coords.longitude);
  }, [location]);

  // Check if location is stale (older than 5 minutes)
  const isLocationStale = useCallback(() => {
    const lastLocationTimestamp = localStorage.getItem('lastLocationTimestamp');
    if (!lastLocationTimestamp) return true;
    
    const lastLocationTime = new Date(lastLocationTimestamp).getTime();
    const currentTime = new Date().getTime();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    return currentTime - lastLocationTime > fiveMinutesInMs;
  }, []);

  return {
    location,
    permissionStatus,
    backgroundPermissionStatus,
    hasShownInitialPrompt,
    hasInitialized,
    isRequesting,
    requestPermission,
    requestBackgroundPermission,
    getCurrentLocation,
    isTracking,
    toggleTracking,
    locationIsValid,
    isLocationStale
  };
}
