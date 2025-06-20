import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@/utils/platform';
import LocationPermissions from '@/plugins/LocationPermissionsPlugin';
import { useStorage } from '@/hooks/useStorage';

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

  // Enhanced fallback function with better error handling for iOS
  const checkPermissionsWithFallback = async () => {
    try {
      console.log('Attempting to check permissions with custom plugin');
      const permissionStatus = await LocationPermissions.checkPermissionStatus();
      
      // Update both state and storage
      setPermissionStatus(permissionStatus.location as LocationPermissionState);
      setBackgroundPermissionStatus(permissionStatus.backgroundLocation as LocationPermissionState);
      setStoredPermission(permissionStatus.location as LocationPermissionState);
      setStoredBackgroundPermission(permissionStatus.backgroundLocation as LocationPermissionState);
      
      console.log('Custom plugin permission check successful:', permissionStatus);
      return true;
    } catch (error) {
      console.warn('Custom LocationPermissions plugin failed, falling back to standard Geolocation API:', error);
      
      // Enhanced error handling - check if it's an "UNIMPLEMENTED" or plugin registration error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isPluginNotRegistered = errorMessage.includes('UNIMPLEMENTED') || 
                                   errorMessage.includes('not implemented') ||
                                   errorMessage.includes('not found') ||
                                   errorMessage.includes('No implementation found');
      
      if (isPluginNotRegistered) {
        console.log('Plugin not properly registered on iOS, using fallback implementation');
      }
      
      try {
        // Fallback to standard Capacitor Geolocation
        const status = await Geolocation.checkPermissions();
        const permState = status.location as LocationPermissionState;
        setPermissionStatus(permState);
        setStoredPermission(permState);
        
        // For fallback, we don't have background permission info, so set to prompt
        setBackgroundPermissionStatus('prompt');
        setStoredBackgroundPermission('prompt');
        
        console.log('Fallback permission check successful:', status);
        return true;
      } catch (fallbackError) {
        console.error('Both custom plugin and fallback permission check failed:', fallbackError);
        setPermissionStatus('denied');
        setStoredPermission('denied');
        return false;
      }
    }
  };

  // Check permissions on component mount
  useEffect(() => {
    const initializePermissions = async () => {
      await checkPermissionsWithFallback();
      await getCurrentLocation();
      setHasInitialized(true);
    };
    
    initializePermissions();
  }, []);
  
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

  // Enhanced request permission with better iOS fallback handling
  const requestPermission = async (): Promise<boolean> => {
    setIsRequesting(true);
    setHasShownInitialPrompt(true);
    setStoredInitialPromptShown(true);
    
    try {
      if (Platform.isNative()) {
        try {
          console.log('Attempting to request permissions with custom plugin');
          // Use custom plugin for requesting foreground permission only
          const result = await LocationPermissions.requestLocationPermission({
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
          if (result.location === 'granted') {
            await getCurrentLocation();
          }
          
          console.log('Custom plugin permission request successful:', result);
          return result.location === 'granted';
        } catch (error) {
          console.warn('Custom plugin permission request failed, falling back to standard API:', error);
          
          // Enhanced error handling for iOS plugin registration issues
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isPluginNotRegistered = errorMessage.includes('UNIMPLEMENTED') || 
                                       errorMessage.includes('not implemented') ||
                                       errorMessage.includes('not found') ||
                                       errorMessage.includes('No implementation found');
          
          if (isPluginNotRegistered && Platform.isIOS()) {
            console.log('iOS plugin not registered properly, using standard Geolocation API');
          }
          
          // Fallback to standard Capacitor Geolocation
          const result = await Geolocation.requestPermissions();
          const locationState = result.location as LocationPermissionState;
          
          setPermissionStatus(locationState);
          setStoredPermission(locationState);
          
          // If permission is granted, get location
          if (result.location === 'granted') {
            await getCurrentLocation();
          }
          
          console.log('Fallback permission request successful:', result);
          return result.location === 'granted';
        }
      } else {
        // Web permission request
        const result = await Geolocation.requestPermissions();
        const locationState = result.location as LocationPermissionState;
        
        setPermissionStatus(locationState);
        setStoredPermission(locationState);
        
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
      
      try {
        // Use custom plugin for requesting both permissions
        const result = await LocationPermissions.requestLocationPermission({
          includeBackground: true
        });
        
        // Update both state and storage
        const locationState = result.location as LocationPermissionState;
        const backgroundState = result.backgroundLocation as LocationPermissionState;
        
        setPermissionStatus(locationState);
        setBackgroundPermissionStatus(backgroundState);
        setStoredPermission(locationState);
        setStoredBackgroundPermission(backgroundState);
        
        return result.backgroundLocation === 'granted';
      } catch (error) {
        console.warn('Custom plugin background permission request failed:', error);
        // For background permissions, we can't fallback to standard API
        // so we just return false
        return false;
      }
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
