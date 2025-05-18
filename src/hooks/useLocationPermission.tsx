
import { useState, useCallback, useEffect } from 'react';
import { Platform } from '@/utils/platform';
import LocationPermissions from '@/plugins/LocationPermissionsPlugin';

export type LocationPermissionState = 'granted' | 'denied' | 'prompt';

export interface LocationPermissionHookResponse {
  permissionStatus: LocationPermissionState;
  backgroundPermissionStatus: LocationPermissionState;
  requestPermission: () => Promise<boolean>;
  requestBackgroundPermission: () => Promise<boolean>;
  checkLocationPermissions: () => Promise<void>;
  isRequesting: boolean;
  hasEducationalUiBeenShown: boolean;
}

export const useLocationPermission = (): LocationPermissionHookResponse => {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionState>('prompt');
  const [backgroundPermissionStatus, setBackgroundPermissionStatus] = useState<LocationPermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasEducationalUiBeenShown, setHasEducationalUiBeenShown] = useState(false);

  // Check location permissions on mount
  const checkLocationPermissions = useCallback(async () => {
    try {
      if (Platform.isNative()) {
        const status = await LocationPermissions.checkPermissionStatus();
        setPermissionStatus(status.location);
        setBackgroundPermissionStatus(status.backgroundLocation);
      } else {
        // For web, just simulate permission status
        setPermissionStatus('granted');
        setBackgroundPermissionStatus('granted');
      }
    } catch (error) {
      console.error("Error checking location permissions:", error);
    }
  }, []);

  useEffect(() => {
    checkLocationPermissions();
  }, [checkLocationPermissions]);

  // Request standard location permission
  const requestPermission = useCallback(async () => {
    setIsRequesting(true);
    try {
      if (Platform.isNative()) {
        const result = await LocationPermissions.requestLocationPermission({ includeBackground: false });
        setPermissionStatus(result.location);
        return result.location === 'granted';
      } else {
        // For web, simulate success
        setPermissionStatus('granted');
        return true;
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  // Request background location permission
  const requestBackgroundPermission = useCallback(async () => {
    if (permissionStatus !== 'granted') {
      console.error("Cannot request background permission without foreground permission");
      return false;
    }

    setIsRequesting(true);
    setHasEducationalUiBeenShown(true);
    
    try {
      if (Platform.isNative()) {
        const result = await LocationPermissions.requestLocationPermission({ includeBackground: true });
        setBackgroundPermissionStatus(result.backgroundLocation);
        return result.backgroundLocation === 'granted';
      } else {
        // For web, simulate success
        setBackgroundPermissionStatus('granted');
        return true;
      }
    } catch (error) {
      console.error("Error requesting background location permission:", error);
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, [permissionStatus]);

  return {
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission,
    requestBackgroundPermission,
    checkLocationPermissions,
    isRequesting,
    hasEducationalUiBeenShown
  };
};
