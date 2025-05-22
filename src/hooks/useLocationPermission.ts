
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
    checkPermissions();
    // Try to get the current location if permission is already granted
    if (permissionStatus === 'granted') {
      getCurrentLocation();
    }
    setHasInitialized(true);
  }, []);
  
  // Direct browser-based implementation for web environments
  const requestBrowserLocation = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      console.error('Browser geolocation API not available');
      toast.error('Location services not available in this browser');
      return false;
    }
    
    try {
      return new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Update location state with browser position
            setLocation({
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            });
            setLastLocationUpdate(new Date());
            
            // Update permission status
            setPermissionStatus('granted');
            setStoredPermission('granted');
            
            toast.success('Location access granted');
            resolve(true);
          },
          (error) => {
            console.error('Browser geolocation error:', error);
            
            // Check error code to determine if permission was denied
            if (error.code === 1) { // PERMISSION_DENIED
              setPermissionStatus('denied');
              setStoredPermission('denied');
              toast.error('Location access denied. Please enable location in your browser settings.');
            } else if (error.code === 2) { // POSITION_UNAVAILABLE
              toast.error('Location information is unavailable');
            } else if (error.code === 3) { // TIMEOUT
              toast.error('Location request timed out');
            } else {
              toast.error('Unknown error occurred when requesting location');
            }
            
            resolve(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      });
    } catch (error) {
      console.error('Browser location request error:', error);
      toast.error('Failed to request location');
      return false;
    }
  };
  
  // Check both foreground and background permissions
  const checkPermissions = async () => {
    // If we're on web, check browser permissions
    if (Platform.isWeb()) {
      try {
        // For web, check if we can access geolocation
        if (navigator.permissions && navigator.permissions.query) {
          const permResult = await navigator.permissions.query({ name: 'geolocation' });
          const webPermState = permResult.state as LocationPermissionState;
          setPermissionStatus(webPermState);
          setStoredPermission(webPermState);
        } else {
          // If permissions API is not available, we'll check on first request
          console.log('Permissions API not available, will check on request');
        }
      } catch (error) {
        console.error('Error checking web location permission:', error);
      }
      return;
    }
    
    // Standard Capacitor implementation for native platforms
    if (Platform.isNative()) {
      try {
        // Use custom plugin for checking both permissions
        const permissionStatus = await LocationPermissions.checkPermissionStatus();
        
        // Update both state and storage
        setPermissionStatus(permissionStatus.location as LocationPermissionState);
        setBackgroundPermissionStatus(permissionStatus.backgroundLocation as LocationPermissionState);
        setStoredPermission(permissionStatus.location as LocationPermissionState);
        setStoredBackgroundPermission(permissionStatus.backgroundLocation as LocationPermissionState);
      } catch (error) {
        console.error('Error checking location permissions:', error);
        
        // Fallback to standard Capacitor Geolocation for foreground permission
        try {
          const status = await Geolocation.checkPermissions();
          const permState = status.location as LocationPermissionState;
          setPermissionStatus(permState);
          setStoredPermission(permState);
        } catch (fallbackError) {
          console.error('Fallback permission check failed:', fallbackError);
          setPermissionStatus('denied');
          setStoredPermission('denied');
        }
      }
    }
  };

  // Helper function to get current location
  const getCurrentLocation = async () => {
    // For web environments, use the browser's geolocation API directly
    if (Platform.isWeb()) {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          console.error('Browser geolocation API not available');
          resolve(null);
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            });
            setLastLocationUpdate(new Date());
            resolve(position);
          },
          (error) => {
            console.error('Error getting browser location:', error);
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });
    }
    
    // For native platforms, use Capacitor Geolocation
    if (permissionStatus === 'granted') {
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true
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
      }
    }
    return null;
  };

  // Request foreground location permission
  const requestPermission = async (): Promise<boolean> => {
    setIsRequesting(true);
    setHasShownInitialPrompt(true);
    setStoredInitialPromptShown(true);
    
    try {
      // For web, use direct browser implementation
      if (Platform.isWeb()) {
        return await requestBrowserLocation();
      }
      
      // For native platforms, use Capacitor plugins
      if (Platform.isNative()) {
        // Use custom plugin for requesting foreground permission only
        try {
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
            return true;
          }
          
          return false;
        } catch (error: any) {
          console.error('Native location permission error:', error);
          
          // Special handling for plugin errors
          if (error.message && error.message.includes('UNIMPLEMENTED')) {
            console.warn('LocationPermissions plugin not fully implemented, falling back to Geolocation');
            // Fall back to standard Capacitor Geolocation
            try {
              const result = await Geolocation.requestPermissions();
              const locationState = result.location as LocationPermissionState;
              
              setPermissionStatus(locationState);
              setStoredPermission(locationState);
              
              if (result.location === 'granted') {
                await getCurrentLocation();
                return true;
              }
              
              return false;
            } catch (fallbackError) {
              console.error('Fallback location permission request failed:', fallbackError);
              toast.error('Could not request location permissions');
              return false;
            }
          }
          
          toast.error('Failed to request location permissions');
          return false;
        }
      }
      
      // Default case if not web or native
      console.warn('No known platform detected for location permission request');
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
      
      if (Platform.isNative() && Platform.isAndroid()) {
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
      }
      
      return false;
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
