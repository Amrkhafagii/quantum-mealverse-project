
import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@/utils/platform';
import LocationPermissions from '@/plugins/LocationPermissionsPlugin';
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
  const [permissionCheckAttempts, setPermissionCheckAttempts] = useState(0);

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

  // Check permissions on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Try to use our plugin to check permissions
        const permissionStatus = await LocationPermissions.checkPermissionStatus();
        
        // Update both state and storage with results that match Capacitor's structure
        setPermissionStatus(permissionStatus.location as LocationPermissionState);
        setBackgroundPermissionStatus(permissionStatus.backgroundLocation as LocationPermissionState);
        setStoredPermission(permissionStatus.location as LocationPermissionState);
        setStoredBackgroundPermission(permissionStatus.backgroundLocation as LocationPermissionState);
        
        // If permission is granted, get the current location
        if (permissionStatus.location === 'granted') {
          getCurrentLocation();
        }
        
        setHasInitialized(true);
      } catch (error) {
        console.error('Error checking location permissions:', error);
        
        // Only retry up to 3 times to avoid infinite loops
        if (permissionCheckAttempts < 3) {
          setPermissionCheckAttempts(prev => prev + 1);
          // Delay retry to avoid rapid failures
          setTimeout(checkPermissions, 1000);
        } else {
          // After 3 failures, set a default state and continue
          setPermissionStatus('prompt');
          setBackgroundPermissionStatus('prompt');
          setHasInitialized(true);
        }
      }
    };
    
    checkPermissions();
  }, [permissionCheckAttempts]);
  
  // Helper function to get current location
  const getCurrentLocation = async () => {
    try {
      if (permissionStatus !== 'granted') {
        return null;
      }
      
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      });
      
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
      return null;
    }
  };

  // Request foreground location permission
  const requestPermission = async (): Promise<boolean> => {
    setIsRequesting(true);
    setHasShownInitialPrompt(true);
    setStoredInitialPromptShown(true);
    
    try {
      // Use our plugin to request permission
      const result = await LocationPermissions.requestPermission({
        includeBackground: false
      });
      
      // Update both state and storage
      const locationState = result.location as LocationPermissionState;
      const backgroundState = result.backgroundLocation as LocationPermissionState;
      
      setPermissionStatus(locationState);
      setBackgroundPermissionStatus(backgroundState);
      setStoredPermission(locationState);
      setStoredBackgroundPermission(backgroundState);
      
      // If permission is granted, get location
      if (locationState === 'granted') {
        await getCurrentLocation();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      toast.error('An error occurred while requesting location permissions');
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
      // Background permissions are only relevant on native platforms
      if (!Platform.isNative()) {
        console.warn('Background location permission is only relevant on native apps');
        return false;
      }
      
      // Use our plugin for requesting background permission
      const result = await LocationPermissions.requestPermission({
        includeBackground: true
      });
      
      // Update both state and storage
      const locationState = result.location as LocationPermissionState;
      const backgroundState = result.backgroundLocation as LocationPermissionState;
      
      setPermissionStatus(locationState);
      setBackgroundPermissionStatus(backgroundState);
      setStoredPermission(locationState);
      setStoredBackgroundPermission(backgroundState);
      
      return backgroundState === 'granted';
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
