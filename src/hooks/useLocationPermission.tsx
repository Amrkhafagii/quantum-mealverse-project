
import { useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export type PermissionState = 'prompt' | 'denied' | 'granted';

export const useLocationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [backgroundPermissionStatus, setBackgroundPermissionStatus] = useState<PermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasEducationalUiBeenShown, setHasEducationalUiBeenShown] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isLocationStale, setIsLocationStale] = useState(false);
  
  // Check permissions on component mount
  useEffect(() => {
    checkLocationPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check current permission status
  const checkLocationPermissions = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      setPermissionStatus('granted');
      setBackgroundPermissionStatus('granted');
      setHasInitialized(true);
      return;
    }

    try {
      const status = await Geolocation.checkPermissions();
      setPermissionStatus(status.location || 'prompt');
      setBackgroundPermissionStatus(status.coarseLocation || 'prompt');
      setHasInitialized(true);
    } catch (error) {
      console.error('Error checking location permissions', error);
      setHasInitialized(true);
    }
  }, []);

  // Request regular location permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    try {
      setIsRequesting(true);
      const status = await Geolocation.requestPermissions();
      setPermissionStatus(status.location || 'prompt');
      
      // Update status of background location too if it's changed
      if (status.coarseLocation) {
        setBackgroundPermissionStatus(status.coarseLocation);
      }
      
      return status.location === 'granted';
    } catch (error) {
      console.error('Error requesting location permission', error);
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  // Request background location permission
  const requestBackgroundPermission = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    // Background location requires foreground location to be granted first
    if (permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      setIsRequesting(true);
      setHasEducationalUiBeenShown(true); // Mark that we've shown the UI
      
      // This would be a platform-specific call in real implementation
      // For now, we'll simulate it with a regular permission request
      const status = await Geolocation.requestPermissions({
        permissions: ['location', 'coarseLocation']
      });
      
      setBackgroundPermissionStatus(status.coarseLocation || 'prompt');
      return status.coarseLocation === 'granted';
    } catch (error) {
      console.error('Error requesting background location permission', error);
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, [permissionStatus, requestPermission]);

  return {
    permissionStatus,
    backgroundPermissionStatus,
    requestPermission,
    requestBackgroundPermission,
    checkLocationPermissions,
    isRequesting,
    hasEducationalUiBeenShown,
    hasInitialized,
    isLocationStale
  };
};
