
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import LocationPermissions from '@/plugins/LocationPermissionsPlugin';
import { useToast } from '@/hooks/use-toast';

export type PermissionState = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';

interface UseLocationPermissionReturn {
  permissionStatus: PermissionState;
  backgroundPermissionStatus: PermissionState;
  requestPermission: () => Promise<boolean>;
  requestBackgroundPermission: () => Promise<boolean>;
  isRequesting: boolean;
}

export function useLocationPermission(): UseLocationPermissionReturn {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [backgroundPermissionStatus, setBackgroundPermissionStatus] = useState<PermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const { toast } = useToast();

  // Check permissions on mount only (or when this hook is used in a new component)
  useEffect(() => {
    let canceled = false;
    async function check() {
      try {
        if (Capacitor.isNativePlatform()) {
          const status = await LocationPermissions.checkPermissionStatus();
          if (!canceled) {
            setPermissionStatus(status.location as PermissionState);
            setBackgroundPermissionStatus(status.backgroundLocation as PermissionState);
          }
        } else {
          // Web fallback: only use genuine Geolocation plugin
          const perm = await Geolocation.checkPermissions();
          if (!canceled) {
            setPermissionStatus(perm.location);
            setBackgroundPermissionStatus('prompt'); // background not supported on web
          }
        }
      } catch (err) {
        if (!canceled) {
          setPermissionStatus('prompt');
          setBackgroundPermissionStatus('prompt');
          toast({
            title: 'Error',
            description: 'Failed to check location permissions',
            variant: 'destructive'
          });
        }
      }
    }
    check();
    return () => {
      canceled = true;
    };
  }, [toast]);

  // Request foreground
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await LocationPermissions.requestPermissions({ includeBackground: false });
        setPermissionStatus(result.location as PermissionState);
        return result.location === 'granted';
      }
      // Only use proper plugin logic on web
      const perm = await Geolocation.requestPermissions();
      setPermissionStatus(perm.location);
      return perm.location === 'granted';
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to request location permission',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, [toast]);

  // Request background (native only)
  const requestBackgroundPermission = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return true;
    setIsRequesting(true);
    try {
      const result = await LocationPermissions.requestPermissions({ includeBackground: true });
      setPermissionStatus(result.location as PermissionState);
      setBackgroundPermissionStatus(result.backgroundLocation as PermissionState);
      return result.backgroundLocation === 'granted';
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to request background location permission',
        variant: 'destructive'
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
  };
}

