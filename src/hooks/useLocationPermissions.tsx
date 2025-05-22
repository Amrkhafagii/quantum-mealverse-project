
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import LocationPermissions from '@/plugins/LocationPermissionsPlugin';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

  // Check permission status on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          try {
            // Try to use our custom LocationPermissions plugin
            const status = await LocationPermissions.checkPermissionStatus();
            setPermissionStatus(status.location as PermissionState);
            setBackgroundPermissionStatus(status.backgroundLocation as PermissionState);
          } catch (pluginError: any) {
            // Handle UNIMPLEMENTED error by falling back to Capacitor Geolocation
            if (pluginError?.code === 'UNIMPLEMENTED') {
              console.log('LocationPermissions plugin not implemented, falling back to Geolocation');
              const permission = await Geolocation.checkPermissions();
              setPermissionStatus(permission.location);
              setBackgroundPermissionStatus(permission.coarseLocation || 'prompt');
            } else {
              console.error('Error checking location permissions:', pluginError);
              // Still try the fallback
              const permission = await Geolocation.checkPermissions();
              setPermissionStatus(permission.location);
              setBackgroundPermissionStatus(permission.coarseLocation || 'prompt');
            }
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
  }, [toast]);

  // Request foreground location permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          // First try our custom plugin
          const result = await LocationPermissions.requestLocationPermission({ includeBackground: false });
          setPermissionStatus(result.location as PermissionState);
          return result.location === 'granted';
        } catch (pluginError: any) {
          // If UNIMPLEMENTED, fall back to Capacitor Geolocation
          if (pluginError?.code === 'UNIMPLEMENTED') {
            console.log('LocationPermissions plugin not implemented, falling back to Geolocation');
            const permission = await Geolocation.requestPermissions();
            setPermissionStatus(permission.location);
            return permission.location === 'granted';
          } else {
            console.error('Error requesting location permission:', pluginError);
            // Try fallback anyway
            const permission = await Geolocation.requestPermissions();
            setPermissionStatus(permission.location);
            return permission.location === 'granted';
          }
        }
      } else {
        // Web implementation
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
  }, [toast]);

  // Request background location permission (Android 10+ specific)
  const requestBackgroundPermission = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      // Only relevant for native platforms
      return true;
    }

    setIsRequesting(true);
    setHasEducationalUiBeenShown(true);
    
    try {
      try {
        // Try our custom plugin first
        const result = await LocationPermissions.requestLocationPermission({ includeBackground: true });
        setPermissionStatus(result.location as PermissionState);
        setBackgroundPermissionStatus(result.backgroundLocation as PermissionState);
        return result.backgroundLocation === 'granted';
      } catch (pluginError: any) {
        // If UNIMPLEMENTED, fall back to regular permission
        if (pluginError?.code === 'UNIMPLEMENTED') {
          console.log('Background location permission not implemented, using regular permission');
          const permission = await Geolocation.requestPermissions();
          setPermissionStatus(permission.location);
          return permission.location === 'granted';
        } else {
          console.error('Error requesting background location permission:', pluginError);
          return false;
        }
      }
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
  }, [toast]);

  return {
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission,
    requestBackgroundPermission,
    isRequesting,
    hasEducationalUiBeenShown
  };
}
