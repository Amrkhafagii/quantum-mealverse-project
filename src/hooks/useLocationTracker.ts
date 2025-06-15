import { useState, useEffect, useCallback } from 'react';
import { getUnifiedCurrentLocation, requestLocationPermission } from '@/utils/unifiedGeolocation';

// Add this utility at the top or import from utils if shared
function parseGeolocationError(err: any): string {
  if (!err) return 'Unknown error occurred while retrieving your location.';
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    // GeolocationPositionError spec
    if (
      'code' in err &&
      'message' in err &&
      typeof err.code !== 'undefined' &&
      typeof err.message === 'string'
    ) {
      // Friendly mapping
      if (err.code === 1) return 'Location access denied. Please enable location in your browser preferences.';
      if (err.code === 2) return 'Location information is unavailable. Try moving to an area with better connectivity.';
      if (err.code === 3) return 'Location request timed out. Please try again.';
      // If browser gives a friendly message, prefer that
      if (err.message && err.message !== '') return err.message;
      return 'Could not get your location. Please check your device settings.';
    }
    // Fallback for common error fields
    if ('message' in err && typeof err.message === 'string') return err.message;
    return JSON.stringify(err);
  }
  return String(err);
}

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationTrackerState {
  location: Location | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
  error: string | null;
  isLocationStale: () => boolean;
  locationIsValid: () => boolean;
}

const defaultLocation: Location = {
  latitude: 0,
  longitude: 0,
};

const defaultState: LocationTrackerState = {
  location: defaultLocation,
  permissionStatus: 'unknown',
  error: null,
  isLocationStale: () => false,
  locationIsValid: () => false,
};

const LOCATION_CACHE_KEY = 'user_location';
const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export function useLocationTracker() {
  const [location, setLocation] = useState<Location | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'prompt' | 'granted' | 'denied' | 'unknown'
  >('unknown');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedLocation = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cachedLocation) {
      try {
        const parsedLocation = JSON.parse(cachedLocation);
        setLocation(parsedLocation);
      } catch (e) {
        console.warn('Error parsing cached location:', e);
        localStorage.removeItem(LOCATION_CACHE_KEY);
      }
    }
  }, []);

  const locationIsValid = useCallback(() => {
    return !!(location && location.latitude !== 0 && location.longitude !== 0);
  }, [location]);

  const isLocationStale = useCallback(() => {
    const cachedLocation = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!cachedLocation) return true;

    try {
      const parsedLocation = JSON.parse(cachedLocation);
      const timestamp = parsedLocation.timestamp;
      if (!timestamp) return true;

      const age = Date.now() - timestamp;
      return age > STALE_THRESHOLD;
    } catch (e) {
      console.warn('Error parsing cached location:', e);
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return true;
    }
  }, []);

  const safeSetError = (err: unknown) => {
    const friendly = parseGeolocationError(err);
    setError(friendly);
    // For debugging
    console.log('[useLocationTracker] setError:', { input: err, parsed: friendly });
  };

  const getCurrentLocation = useCallback(async (): Promise<Location | null> => {
    try {
      const permission = await requestLocationPermission();
      setPermissionStatus(permission);

      if (permission !== 'granted') {
        safeSetError('Location permission denied');
        return null;
      }

      const position = await getUnifiedCurrentLocation();

      if (position) {
        const { latitude, longitude } = position;
        const newLocation = { latitude, longitude };
        setLocation(newLocation);
        localStorage.setItem(
          LOCATION_CACHE_KEY,
          JSON.stringify({ ...newLocation, timestamp: Date.now() })
        );
        setError(null);
        return newLocation;
      } else {
        safeSetError('Could not get location');
        return null;
      }
    } catch (e) {
      safeSetError(e);
      return null;
    }
  }, []);

  return {
    ...defaultState,
    location,
    permissionStatus,
    error,
    getCurrentLocation,
    locationIsValid,
    isLocationStale,
  };
}
