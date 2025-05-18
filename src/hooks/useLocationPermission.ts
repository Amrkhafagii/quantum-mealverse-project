
import { useState, useEffect } from 'react';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { Platform } from '@/utils/platform';
import LocationPermissions from '@/plugins/LocationPermissionsPlugin';

export type LocationPermissionState = 'prompt' | 'granted' | 'denied';

export interface LocationPermissionHookResponse {
  permissionStatus: LocationPermissionState;
  backgroundPermissionStatus: LocationPermissionState;
  requestPermission: () => Promise<boolean>;
  requestBackgroundPermission: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  isRequesting: boolean;
  hasEducationalUiBeenShown: boolean;
  showEducationalUi: () => void;
  trackingEnabled: boolean;
  enableTracking: (enable: boolean) => void;
  // Add missing properties that other components are trying to access
  location: { coords: { latitude: number; longitude: number } } | null;
  isLocationStale: () => boolean;
  hasInitialized: boolean;
  isTracking: boolean;
  toggleTracking: () => Promise<boolean>;
  hasShownInitialPrompt: boolean;
}

export function useLocationPermission(): LocationPermissionHookResponse {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionState>('prompt');
  const [backgroundPermissionStatus, setBackgroundPermissionStatus] = useState<LocationPermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasEducationalUiBeenShown, setHasEducationalUiBeenShown] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [location, setLocation] = useState<{ coords: { latitude: number; longitude: number } } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);
  const [hasShownInitialPrompt, setHasShownInitialPrompt] = useState(false);

  // Check permissions on component mount
  useEffect(() => {
    checkPermissions();
    // Simulate getting the current location
    getCurrentLocation();
    setHasInitialized(true);
  }, []);
  
  // Check both foreground and background permissions
  const checkPermissions = async () => {
    if (Platform.isNative()) {
      try {
        // Use custom plugin for checking both permissions
        const permissionStatus = await LocationPermissions.checkPermissionStatus();
        
        setPermissionStatus(permissionStatus.location as LocationPermissionState);
        setBackgroundPermissionStatus(permissionStatus.backgroundLocation as LocationPermissionState);
      } catch (error) {
        console.error('Error checking location permissions:', error);
        
        // Fallback to standard Capacitor Geolocation for foreground permission
        try {
          const status = await Geolocation.checkPermissions();
          setPermissionStatus(status.location as LocationPermissionState);
        } catch (fallbackError) {
          console.error('Fallback permission check failed:', fallbackError);
          setPermissionStatus('denied');
        }
      }
    } else {
      try {
        // Web permission check
        const status = await Geolocation.checkPermissions();
        setPermissionStatus(status.location as LocationPermissionState);
      } catch (error) {
        console.error('Error checking web location permission:', error);
        setPermissionStatus('denied');
      }
    }
  };

  // Helper function to get current location
  const getCurrentLocation = async () => {
    if (permissionStatus === 'granted') {
      try {
        const position = await Geolocation.getCurrentPosition();
        setLocation({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        });
        setLastLocationUpdate(new Date());
        return position;
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    }
    return null;
  };

  // Request foreground location permission
  const requestPermission = async (): Promise<boolean> => {
    setIsRequesting(true);
    setHasShownInitialPrompt(true);
    
    try {
      if (Platform.isNative()) {
        // Use custom plugin for requesting foreground permission only
        const result = await LocationPermissions.requestLocationPermission({
          includeBackground: false
        });
        
        setPermissionStatus(result.location as LocationPermissionState);
        setBackgroundPermissionStatus(result.backgroundLocation as LocationPermissionState);
        
        // If permission is granted, get location
        if (result.location === 'granted') {
          await getCurrentLocation();
        }
        
        return result.location === 'granted';
      } else {
        // Web permission request
        const result = await Geolocation.requestPermissions();
        setPermissionStatus(result.location as LocationPermissionState);
        
        // If permission is granted, get location
        if (result.location === 'granted') {
          await getCurrentLocation();
        }
        
        return result.location === 'granted';
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    } finally {
      setIsRequesting(false);
    }
  };
  
  // Request background location permission (requires foreground permission first)
  const requestBackgroundPermission = async (): Promise<boolean> => {
    if (permissionStatus !== 'granted') {
      console.warn('Foreground location permission must be granted before requesting background permission');
      return false;
    }
    
    setIsRequesting(true);
    
    try {
      if (!Platform.isNative() || !Platform.isAndroid()) {
        console.warn('Background location permission is only relevant on Android native app');
        return false;
      }
      
      // Use custom plugin for requesting both permissions
      const result = await LocationPermissions.requestLocationPermission({
        includeBackground: true
      });
      
      setPermissionStatus(result.location as LocationPermissionState);
      setBackgroundPermissionStatus(result.backgroundLocation as LocationPermissionState);
      
      return result.backgroundLocation === 'granted';
    } catch (error) {
      console.error('Error requesting background location permission:', error);
      return false;
    } finally {
      setIsRequesting(false);
    }
  };
  
  // Request both foreground and background permissions (if needed)
  const requestPermissions = async (): Promise<boolean> => {
    // First, request foreground permission if needed
    if (permissionStatus !== 'granted') {
      const foregroundGranted = await requestPermission();
      if (!foregroundGranted) return false;
    }
    
    // Then, request background permission if on Android
    if (Platform.isNative() && Platform.isAndroid()) {
      // Show educational UI before requesting background permission
      showEducationalUi();
      
      // Request background permission
      return await requestBackgroundPermission();
    }
    
    return permissionStatus === 'granted';
  };
  
  // Show educational UI explaining why background location is needed
  const showEducationalUi = () => {
    setHasEducationalUiBeenShown(true);
  };
  
  // Toggle location tracking
  const enableTracking = (enable: boolean) => {
    setTrackingEnabled(enable);
    setIsTracking(enable);
  };
  
  // Toggle tracking on/off
  const toggleTracking = async (): Promise<boolean> => {
    const newTrackingState = !isTracking;
    
    if (newTrackingState && permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }
    
    setIsTracking(newTrackingState);
    setTrackingEnabled(newTrackingState);
    return newTrackingState;
  };
  
  // Check if location is stale (older than 2 minutes)
  const isLocationStale = (): boolean => {
    if (!lastLocationUpdate) return true;
    
    const twoMinutesAgo = new Date();
    twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);
    
    return lastLocationUpdate < twoMinutesAgo;
  };

  return {
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission,
    requestBackgroundPermission,
    requestPermissions,
    isRequesting,
    hasEducationalUiBeenShown,
    showEducationalUi,
    trackingEnabled,
    enableTracking,
    location,
    isLocationStale,
    hasInitialized,
    isTracking,
    toggleTracking,
    hasShownInitialPrompt
  };
}
