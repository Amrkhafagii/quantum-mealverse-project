import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@/utils/platform';
import LocationPermissions from '@/plugins/LocationPermissionsPlugin';
import { useStorage } from '@/hooks/useStorage';
import { toast } from 'sonner';
import { useBridgeErrorHandler } from '@/hooks/useBridgeErrorHandler';

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
  // Use storage hook for persistent data with error handling
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
  const [pluginInitialized, setPluginInitialized] = useState(false);

  // Add bridge error handler
  const { executeBridgeFunction } = useBridgeErrorHandler({
    showToast: true,
    toastOptions: { duration: 4000 }
  });

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

  // Initialize the plugin with better error handling
  useEffect(() => {
    const initializePlugin = async () => {
      if (!Platform.isNative() || pluginInitialized) {
        setHasInitialized(true);
        return;
      }
      
      try {
        // Wait before initializing to allow native code to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        setPluginInitialized(true);
        checkPermissions();
      } catch (error) {
        console.error('Error initializing location plugin with detailed error:', error);
        toast.error('Failed to initialize location services. Please restart the app.');
        setHasInitialized(true); // Continue with the app despite errors
      }
    };
    
    initializePlugin();
  }, []);

  // Check permissions with better error handling
  const checkPermissions = useCallback(async () => {
    if (!Platform.isNative()) {
      setHasInitialized(true);
      return;
    }
    
    const result = await executeBridgeFunction(
      async () => {
        const permissionStatus = await LocationPermissions.checkPermissionStatus();
        
        // Update both state and storage with results that match Capacitor's structure
        setPermissionStatus(permissionStatus.location as LocationPermissionState);
        setBackgroundPermissionStatus(permissionStatus.backgroundLocation as LocationPermissionState);
        
        // Only update storage if the values actually changed
        if (storedPermission !== permissionStatus.location) {
          setStoredPermission(permissionStatus.location as LocationPermissionState);
        }
        
        if (storedBackgroundPermission !== permissionStatus.backgroundLocation) {
          setStoredBackgroundPermission(permissionStatus.backgroundLocation as LocationPermissionState);
        }
        
        // If permission is granted, get the current location
        if (permissionStatus.location === 'granted') {
          getCurrentLocation();
        }
        
        setHasInitialized(true);
        setPermissionCheckAttempts(0); // Reset attempts on success
        
        return permissionStatus;
      },
      'Failed to check location permissions'
    );
    
    if (!result) {
      // Handle the error case - set default values but continue the app
      setPermissionStatus('prompt');
      setBackgroundPermissionStatus('prompt');
      setHasInitialized(true);
    }
  }, [executeBridgeFunction, setStoredPermission, setStoredBackgroundPermission, storedPermission, storedBackgroundPermission]);
  
  // Effect to check permissions when plugin is initialized
  useEffect(() => {
    if (pluginInitialized) {
      checkPermissions();
    }
  }, [pluginInitialized, checkPermissions]);
  
  // Helper function to get current location with better error handling
  const getCurrentLocation = async () => {
    return executeBridgeFunction(
      async () => {
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
      },
      'Unable to get your current location'
    );
  };

  // Request foreground location permission with better error handling
  const requestPermission = async (): Promise<boolean> => {
    setIsRequesting(true);
    setHasShownInitialPrompt(true);
    setStoredInitialPromptShown(true);
    
    const result = await executeBridgeFunction(
      async () => {
        if (Platform.isWeb()) {
          // Web implementation - use Capacitor's Geolocation API
          const { location } = await Geolocation.requestPermissions();
          const locationState = location as LocationPermissionState;
          
          setPermissionStatus(locationState);
          setStoredPermission(locationState);
          
          if (locationState === 'granted') {
            await getCurrentLocation();
            return true;
          }
          
          return false;
        }
        
        // Native implementation - use our plugin
        const result = await LocationPermissions.requestPermissions({
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
      },
      'An error occurred while requesting location permissions'
    );
    
    setIsRequesting(false);
    return result === true;
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
      
      // Use our plugin for requesting background permission - Updated to use requestPermissions
      const result = await LocationPermissions.requestPermissions({
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
