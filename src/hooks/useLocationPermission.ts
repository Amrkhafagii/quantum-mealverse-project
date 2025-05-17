
import { useState, useEffect } from 'react';
import { Geolocation, GeolocationPermissionState } from '@capacitor/geolocation';
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
}

export function useLocationPermission(): LocationPermissionHookResponse {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionState>('prompt');
  const [backgroundPermissionStatus, setBackgroundPermissionStatus] = useState<LocationPermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasEducationalUiBeenShown, setHasEducationalUiBeenShown] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  // Check permissions on component mount
  useEffect(() => {
    checkPermissions();
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
          setPermissionStatus(status.location);
        } catch (fallbackError) {
          console.error('Fallback permission check failed:', fallbackError);
          setPermissionStatus('denied');
        }
      }
    } else {
      try {
        // Web permission check
        const status = await Geolocation.checkPermissions();
        setPermissionStatus(status.location);
      } catch (error) {
        console.error('Error checking web location permission:', error);
        setPermissionStatus('denied');
      }
    }
  };

  // Request foreground location permission
  const requestPermission = async (): Promise<boolean> => {
    setIsRequesting(true);
    
    try {
      if (Platform.isNative()) {
        // Use custom plugin for requesting foreground permission only
        const result = await LocationPermissions.requestLocationPermission({
          includeBackground: false
        });
        
        setPermissionStatus(result.location as LocationPermissionState);
        setBackgroundPermissionStatus(result.backgroundLocation as LocationPermissionState);
        
        return result.location === 'granted';
      } else {
        // Web permission request
        const result = await Geolocation.requestPermissions();
        setPermissionStatus(result.location);
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
    enableTracking
  };
}
