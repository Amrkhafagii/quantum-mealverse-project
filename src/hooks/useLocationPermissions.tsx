
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import LocationPermissions, { LocationPermissionStatus } from '@/plugins/LocationPermissionsPlugin';
import { toast } from '@/components/ui/use-toast';

interface LocationPermissionsHookReturn {
  permissionStatus: PermissionState;
  backgroundPermissionStatus: PermissionState;
  requestPermission: () => Promise<boolean>;
  requestBackgroundPermission: () => Promise<boolean>;
  isRequesting: boolean;
  hasEducationalUiBeenShown: boolean;
}

export function useLocationPermissions(): LocationPermissionsHookReturn {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [backgroundPermissionStatus, setBackgroundPermissionStatus] = useState<PermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasEducationalUiBeenShown, setHasEducationalUiBeenShown] = useState(false);

  // Check permission status on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          if (Capacitor.getPlatform() === 'android') {
            // Use our native Android implementation
            const status = await LocationPermissions.checkPermissionStatus();
            setPermissionStatus(status.location as PermissionState);
            setBackgroundPermissionStatus(status.backgroundLocation as PermissionState);
          } else {
            // Default to Capacitor Geolocation for iOS and other platforms
            const permission = await Geolocation.checkPermissions();
            setPermissionStatus(permission.location);
            setBackgroundPermissionStatus(permission.coarseLocation || 'prompt');
          }
        } else {
          // Web fallback
          const permission = await Geolocation.checkPermissions();
          setPermissionStatus(permission.location);
          setBackgroundPermissionStatus('prompt'); // No real background concept in web
        }
      } catch (err) {
        console.error('Error checking location permissions:', err);
        toast({
          title: "Error",
          description: "Could not check location permissions",
          variant: "destructive"
        });
      }
    };
    
    checkPermissions();
  }, []);

  // Request foreground location permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    try {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        // Use our Android native implementation
        const result = await LocationPermissions.requestLocationPermission({ includeBackground: false });
        setPermissionStatus(result.location as PermissionState);
        return result.location === 'granted';
      } else {
        // Use Capacitor for other platforms
        const permission = await Geolocation.requestPermissions();
        setPermissionStatus(permission.location);
        return permission.location === 'granted';
      }
    } catch (err) {
      console.error('Error requesting location permission:', err);
      toast({
        title: "Error",
        description: "Could not request location permissions",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  // Request background location permission (Android 10+ specific)
  const requestBackgroundPermission = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      // Only relevant for Android
      return true;
    }

    setIsRequesting(true);
    setHasEducationalUiBeenShown(true);
    
    try {
      const result = await LocationPermissions.requestLocationPermission({ includeBackground: true });
      setPermissionStatus(result.location as PermissionState);
      setBackgroundPermissionStatus(result.backgroundLocation as PermissionState);
      return result.backgroundLocation === 'granted';
    } catch (err) {
      console.error('Error requesting background location permission:', err);
      toast({
        title: "Error",
        description: "Could not request background location permissions",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  return {
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission,
    requestBackgroundPermission,
    isRequesting,
    hasEducationalUiBeenShown
  };
}
