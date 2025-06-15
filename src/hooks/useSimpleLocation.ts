
import { useState, useEffect, useCallback } from 'react';
import { getUnifiedCurrentLocation, requestLocationPermission } from '@/utils/unifiedGeolocation';

export interface SimpleLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationState {
  location: SimpleLocation | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
  hasRequestedPermission: boolean;
}

export const useSimpleLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    isLoading: false,
    error: null,
    permissionStatus: 'unknown',
    hasRequestedPermission: false
  });

  const getCurrentLocation = useCallback(async (): Promise<SimpleLocation | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const permission = await requestLocationPermission();
      if (permission !== 'granted') {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Location permission not granted',
          permissionStatus: permission
        }));
        return null;
      }
      const location = await getUnifiedCurrentLocation();
      if (!location) throw new Error('Could not get location');
      const loc: SimpleLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: typeof location.timestamp === 'number' ? location.timestamp : Date.now()
      };
      setState((prev) => ({
        ...prev,
        location: loc,
        isLoading: false,
        error: null,
        permissionStatus: 'granted'
      }));
      localStorage.setItem('lastKnownLocation', JSON.stringify(loc));
      return loc;
    } catch (e: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: e?.message || 'Unable to access your location',
        permissionStatus: 'denied'
      }));
      return null;
    }
  }, []);

  const requestLocation = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, hasRequestedPermission: true }));
    const loc = await getCurrentLocation();
    return loc !== null;
  }, [getCurrentLocation]);

  useEffect(() => {
    const cachedLocation = localStorage.getItem('lastKnownLocation');
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        const age = Date.now() - parsed.timestamp;
        if (age < 1800000) { // 30 mins
          setState((prev) => ({
            ...prev,
            location: parsed,
            permissionStatus: 'granted'
          }));
        }
      } catch {
        localStorage.removeItem('lastKnownLocation');
      }
    }
  }, []);

  return {
    ...state,
    isSupported: true,
    requestLocation,
    getCurrentLocation
  };
};

