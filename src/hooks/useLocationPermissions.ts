
import { useState, useCallback, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

type PermissionStatus = 'granted' | 'denied' | 'prompt';

export function useLocationPermissions() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('prompt');
  const [backgroundPermission, setBackgroundPermission] = useState<PermissionStatus>('prompt');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkPermissions = useCallback(async () => {
    try {
      if (!Capacitor.isPluginAvailable('Geolocation')) {
        // No geolocation available, set to prompt
        setPermissionStatus('prompt');
        return permissionStatus;
      }

      // On the web, we can check permissions through the browser
      if (Capacitor.getPlatform() === 'web') {
        if ('permissions' in navigator) {
          const permResult = await navigator.permissions.query({ name: 'geolocation' });
          if (permResult.state === 'granted') {
            setPermissionStatus('granted');
          } else if (permResult.state === 'denied') {
            setPermissionStatus('denied');
          } else {
            setPermissionStatus('prompt');
          }
        } else {
          // Older browsers - can only check by trying to get location
          try {
            await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                maximumAge: 3600000 // 1 hour
              });
            });
            setPermissionStatus('granted');
          } catch (error) {
            if ((error as GeolocationPositionError).code === (error as GeolocationPositionError).PERMISSION_DENIED) {
              setPermissionStatus('denied');
            } else {
              // Something else went wrong, might be timeout
              setPermissionStatus('prompt');
            }
          }
        }
      } else {
        // On native platforms, use Capacitor
        try {
          // This will prompt for permission if not yet granted
          await Geolocation.checkPermissions();
          setPermissionStatus('granted');
        } catch (error) {
          console.error('Error checking permissions:', error);
          setPermissionStatus('denied');
        }
      }
      
      setLastChecked(new Date());
      return permissionStatus;
    } catch (error) {
      console.error('Error checking location permissions:', error);
      setPermissionStatus('prompt');
      return permissionStatus;
    }
  }, [permissionStatus]);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (!Capacitor.isPluginAvailable('Geolocation')) {
        return false;
      }

      const result = await Geolocation.requestPermissions();
      
      if (result.location === 'granted') {
        setPermissionStatus('granted');
        setLastChecked(new Date());
        return true;
      } else {
        setPermissionStatus('denied');
        setLastChecked(new Date());
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      setPermissionStatus('denied');
      setLastChecked(new Date());
      return false;
    }
  }, []);

  // Check permissions on component mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissionStatus,
    backgroundPermission,
    lastChecked,
    checkPermissions,
    requestPermissions
  };
}
