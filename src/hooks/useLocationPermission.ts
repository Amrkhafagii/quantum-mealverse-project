import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import LocationPermissions from '@/plugins/LocationPermissionsPlugin';
import { useToast } from '@/hooks/use-toast';

// Existing type
export type PermissionState = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';

// Add generic location type (matches web/capacitor Position)
export type BasicLocation = { coords: { latitude: number, longitude: number }; [key: string]: any } | null;

// FULL union of all properties expected by components, even if deprecated/not-implemented here
interface UseLocationPermissionReturn {
  permissionStatus: PermissionState;
  backgroundPermissionStatus: PermissionState;
  requestPermission: () => Promise<boolean>;
  requestBackgroundPermission: () => Promise<boolean>;
  isRequesting: boolean;
  // The following are for compatibility only (some will be undefined or minimal impl):
  location?: BasicLocation; // last acquired position, or undefined
  hasEducationalUiBeenShown?: boolean;
  requestPermissions?: () => Promise<boolean>;
  trackingEnabled?: boolean;
  enableTracking?: (enabled: boolean) => void;
  toggleTracking?: () => void;
  isTracking?: boolean;
  hasShownInitialPrompt?: boolean;
  hasInitialized?: boolean;
  isLocationStale?: boolean;
}

export function useLocationPermission(): UseLocationPermissionReturn {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [backgroundPermissionStatus, setBackgroundPermissionStatus] = useState<PermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [location, setLocation] = useState<BasicLocation>(null);
  const [hasEducationalUiBeenShown] = useState<boolean>(false);
  // The rest are stubs for now for interface compatibility
  const [trackingEnabled] = useState<boolean>(false);
  const [isTracking] = useState<boolean>(false);
  const [hasShownInitialPrompt] = useState<boolean>(false);
  const [hasInitialized] = useState<boolean>(true);

  const { toast } = useToast();

  // Check permissions on mount
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
          const perm = await Geolocation.checkPermissions();
          if (!canceled) {
            setPermissionStatus(perm.location);
            setBackgroundPermissionStatus('prompt');
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
    return () => { canceled = true; };
  }, [toast]);

  // Optionally fetch actual location when permission changes
  useEffect(() => {
    let canceled = false;
    async function fetchLocation() {
      if (permissionStatus === 'granted') {
        try {
          const pos = await Geolocation.getCurrentPosition();
          if (!canceled) setLocation(pos);
        } catch (err) {
          if (!canceled) setLocation(null);
        }
      }
    }
    fetchLocation();
    return () => { canceled = true; };
  }, [permissionStatus]);

  // Request foreground
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await LocationPermissions.requestPermissions({ includeBackground: false });
        setPermissionStatus(result.location as PermissionState);
        return result.location === 'granted';
      }
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

  // Provide requestPermissions for legacy usage (now just requestPermission)
  const requestPermissions = requestPermission;

  // Minimal no-ops for compat; real tracking should be refactored to use a tracking/location service hook
  const enableTracking = () => {};
  const toggleTracking = () => {};

  // Fix for legacy compatibility: provide isLocationStale as a function
  const isLocationStale = useCallback(() => false, []);

  return {
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission,
    requestBackgroundPermission,
    isRequesting,
    // For build compatibility / legacy props below:
    location,
    hasEducationalUiBeenShown,
    requestPermissions,
    trackingEnabled,
    enableTracking,
    toggleTracking,
    isTracking,
    hasShownInitialPrompt,
    hasInitialized,
    isLocationStale, // <-- this is now a function
  };
}
