
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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

  // Check if geolocation is supported
  const isSupported = 'geolocation' in navigator;

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<SimpleLocation | null> => {
    if (!isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: 'Geolocation is not supported by this browser',
        permissionStatus: 'denied'
      }));
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const location: SimpleLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        location,
        isLoading: false,
        error: null,
        permissionStatus: 'granted'
      }));

      // Cache location in localStorage
      localStorage.setItem('lastKnownLocation', JSON.stringify(location));

      return location;
    } catch (error: any) {
      let errorMessage = 'Unable to get your location';
      let permissionStatus: 'denied' | 'prompt' = 'denied';

      switch (error.code) {
        case 1: // PERMISSION_DENIED
          errorMessage = 'Location access denied';
          permissionStatus = 'denied';
          break;
        case 2: // POSITION_UNAVAILABLE
          errorMessage = 'Location information is unavailable';
          break;
        case 3: // TIMEOUT
          errorMessage = 'Location request timed out';
          break;
        default:
          errorMessage = 'An error occurred while getting your location';
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        permissionStatus
      }));

      return null;
    }
  }, [isSupported]);

  // Request location permission and get location
  const requestLocation = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, hasRequestedPermission: true }));
    const location = await getCurrentLocation();
    return location !== null;
  }, [getCurrentLocation]);

  // Load cached location on mount
  useEffect(() => {
    const cachedLocation = localStorage.getItem('lastKnownLocation');
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        const age = Date.now() - parsed.timestamp;
        
        // Use cached location if less than 1 hour old
        if (age < 3600000) {
          setState(prev => ({
            ...prev,
            location: parsed,
            permissionStatus: 'granted'
          }));
        }
      } catch (e) {
        console.warn('Failed to parse cached location');
      }
    }
  }, []);

  return {
    ...state,
    isSupported,
    requestLocation,
    getCurrentLocation
  };
};
