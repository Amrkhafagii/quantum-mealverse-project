
import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@/utils/platform';
import { useStorage } from '@/hooks/useStorage';
import { toast } from 'sonner';

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
  location: { coords: { latitude: number; longitude: number } } | null;
  isLocationStale: () => boolean;
  hasInitialized: boolean;
  isTracking: boolean;
  toggleTracking: () => Promise<boolean>;
  hasShownInitialPrompt: boolean;
}

// Local storage keys
const LOCATION_PERMISSION_KEY = 'location_permission_status';
const BACKGROUND_PERMISSION_KEY = 'background_permission_status';
const EDUCATIONAL_UI_SHOWN_KEY = 'location_educational_ui_shown';
const INITIAL_PROMPT_SHOWN_KEY = 'location_initial_prompt_shown';

export function useLocationPermission(): LocationPermissionHookResponse {
  // Use storage hook for persistent data
  const { value: storedPermission, setValue: setStoredPermission } = useStorage<LocationPermissionState>(
    LOCATION_PERMISSION_KEY, 
    'prompt'
  );
  
  const { value: storedBackgroundPermission, setValue: setStoredBackgroundPermission } = useStorage<LocationPermissionState>(
    BACKGROUND_PERMISSION_KEY, 
    'prompt'
  );
  
  const { value: storedEducationalUiShown, setValue: setStoredEducationalUiShown } = useStorage<boolean>(
    EDUCATIONAL_UI_SHOWN_KEY, 
    false
  );
  
  const { value: storedInitialPromptShown, setValue: setStoredInitialPromptShown } = useStorage<boolean>(
    INITIAL_PROMPT_SHOWN_KEY, 
    false
  );

  // Define state variables with default values from storage
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

  // Initialize state from storage values when available
  useEffect(() => {
    if (storedPermission !== null && storedPermission !== undefined) {
      setPermissionStatus(storedPermission);
    }
    
    if (storedBackgroundPermission !== null && storedBackgroundPermission !== undefined) {
      setBackgroundPermissionStatus(storedBackgroundPermission);
    }
    
    if (storedEducationalUiShown !== null && storedEducationalUiShown !== undefined) {
      setHasEducationalUiBeenShown(storedEducationalUiShown);
    }
    
    if (storedInitialPromptShown !== null && storedInitialPromptShown !== undefined) {
      setHasShownInitialPrompt(storedInitialPromptShown);
    }
  }, [storedPermission, storedBackgroundPermission, storedEducationalUiShown, storedInitialPromptShown]);

  // Enhanced fallback function with better web support
  const checkPermissionsWithFallback = async () => {
    try {
      // For web, use standard Geolocation API directly
      if (!Platform.isNative()) {
        console.log('Web environment detected, using standard Geolocation API');
        
        if (!navigator.geolocation) {
          setPermissionStatus('denied');
          setStoredPermission('denied');
          return false;
        }

        // Check if permissions API is available (newer browsers)
        if ('permissions' in navigator) {
          try {
            const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
            const status = result.state === 'granted' ? 'granted' : 
                          result.state === 'denied' ? 'denied' : 'prompt';
            
            setPermissionStatus(status);
            setStoredPermission(status);
            setBackgroundPermissionStatus('denied'); // Web doesn't support background
            setStoredBackgroundPermission('denied');
            
            console.log('Web permission status:', status);
            return true;
          } catch (permError) {
            console.warn('Permissions API not fully supported, will request on first use');
          }
        }
        
        // For browsers without permissions API, assume prompt state
        setPermissionStatus('prompt');
        setStoredPermission('prompt');
        setBackgroundPermissionStatus('denied');
        setStoredBackgroundPermission('denied');
        return true;
      }

      // For native apps, try Capacitor Geolocation
      console.log('Native environment, checking Capacitor permissions');
      const status = await Geolocation.checkPermissions();
      const permState = status.location as LocationPermissionState;
      
      setPermissionStatus(permState);
      setStoredPermission(permState);
      setBackgroundPermissionStatus('prompt');
      setStoredBackgroundPermission('prompt');
      
      console.log('Native permission check successful:', status);
      return true;
    } catch (error) {
      console.error('Permission check failed:', error);
      // Set to prompt state so user can try to request
      setPermissionStatus('prompt');
      setStoredPermission('prompt');
      return false;
    }
  };

  // Check permissions on component mount
  useEffect(() => {
    const initializePermissions = async () => {
      await checkPermissionsWithFallback();
      setHasInitialized(true);
    };
    
    initializePermissions();
  }, []);
  
  // Helper function to get current location
  const getCurrentLocation = async () => {
    if (permissionStatus === 'granted') {
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
        
        const locationData = {
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        };
        
        setLocation(locationData);
        setLastLocationUpdate(new Date());
        return position;
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    }
    return null;
  };

  // Enhanced request permission with better web handling
  const requestPermission = async (): Promise<boolean> => {
    if (isRequesting) return permissionStatus === 'granted';
    
    setIsRequesting(true);
    setHasShownInitialPrompt(true);
    setStoredInitialPromptShown(true);
    
    try {
      if (!Platform.isNative()) {
        // Web permission request using standard API
        console.log('Requesting web location permission');
        
        if (!navigator.geolocation) {
          setPermissionStatus('denied');
          setStoredPermission('denied');
          return false;
        }

        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Web location permission granted');
              setPermissionStatus('granted');
              setStoredPermission('granted');
              
              // Set the location immediately
              setLocation({
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                }
              });
              setLastLocationUpdate(new Date());
              
              resolve(true);
            },
            (error) => {
              console.log('Web location permission error:', error.code, error.message);
              
              if (error.code === 1) { // PERMISSION_DENIED
                setPermissionStatus('denied');
                setStoredPermission('denied');
              } else {
                setPermissionStatus('prompt');
                setStoredPermission('prompt');
              }
              
              resolve(error.code !== 1); // Return true for non-permission errors
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });
      } else {
        // Native permission request
        console.log('Requesting native location permission');
        const result = await Geolocation.requestPermissions();
        const locationState = result.location as LocationPermissionState;
        
        setPermissionStatus(locationState);
        setStoredPermission(locationState);
        
        // If permission is granted, get location
        if (result.location === 'granted') {
          await getCurrentLocation();
        }
        
        console.log('Native permission request result:', result);
        return result.location === 'granted';
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    } finally {
      setIsRequesting(false);
    }
  };
  
  // Request background location permission (only relevant for native Android)
  const requestBackgroundPermission = async (): Promise<boolean> => {
    if (permissionStatus !== 'granted') {
      console.warn('Foreground location permission must be granted before requesting background permission');
      return false;
    }
    
    if (!Platform.isNative() || !Platform.isAndroid()) {
      console.warn('Background location permission is only relevant on Android native app');
      return false;
    }
    
    // For background permissions, we would need a more advanced plugin
    // For now, return false as it's not implemented
    return false;
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
      showEducationalUi();
      return await requestBackgroundPermission();
    }
    
    return permissionStatus === 'granted';
  };
  
  // Show educational UI explaining why background location is needed
  const showEducationalUi = () => {
    setHasEducationalUiBeenShown(true);
    setStoredEducationalUiShown(true);
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
