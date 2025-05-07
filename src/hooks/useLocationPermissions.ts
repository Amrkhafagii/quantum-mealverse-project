
import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export function useLocationPermissions() {
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Check permission status on load
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permission = await Geolocation.checkPermissions();
        // Handle possible values from Capacitor
        if (permission.location === 'granted') {
          setPermissionStatus('granted');
        } else if (permission.location === 'denied') {
          setPermissionStatus('denied');
        } else {
          setPermissionStatus('prompt');
        }
      } catch (err) {
        console.error('Error checking location permissions', err);
      }
    };
    
    checkPermissions();
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const permission = await Geolocation.requestPermissions();
      // Handle possible values from Capacitor
      if (permission.location === 'granted') {
        setPermissionStatus('granted');
        return true;
      } else {
        setPermissionStatus('denied');
        return false;
      }
    } catch (err) {
      console.error('Error requesting location permissions', err);
      return false;
    }
  }, []);

  return {
    permissionStatus,
    requestPermissions
  };
}
