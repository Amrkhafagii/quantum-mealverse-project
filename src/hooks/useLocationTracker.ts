
import { useState, useEffect, useCallback } from 'react';

interface LocationTrackerOptions {
  watchPosition?: boolean;
  trackingInterval?: number; // milliseconds
  onLocationUpdate?: (position: GeolocationPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
}

interface Location {
  latitude: number;
  longitude: number;
}

export const useLocationTracker = (options: LocationTrackerOptions = {}) => {
  const {
    watchPosition = true,
    trackingInterval = 10000, // Default to 10 seconds
    onLocationUpdate,
    onError
  } = options;

  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const clearWatchPosition = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  const clearTrackingInterval = useCallback(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setPosition(pos);
    // Also set the simplified location object
    setLocation({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    });
    setLastUpdated(new Date());
    setError(null);
    if (onLocationUpdate) {
      onLocationUpdate(pos);
    }
  }, [onLocationUpdate]);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setError(err);
    if (onError) {
      onError(err);
    }
  }, [onError]);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      const errorObject = {
        code: 0,
        message: 'Geolocation not supported',
      } as GeolocationPositionError;
      
      setError(errorObject);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [handleSuccess, handleError]);

  // Add a new method that returns a promise with the location
  const getCurrentLocation = useCallback((): Promise<Location | null> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorObject = {
          code: 0,
          message: 'Geolocation not supported',
        } as GeolocationPositionError;
        
        setError(errorObject);
        reject(errorObject);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          setLocation(loc);
          setPosition(pos);
          setLastUpdated(new Date());
          resolve(loc);
        },
        (err) => {
          setError(err);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      const errorObject = {
        code: 0,
        message: 'Geolocation not supported',
      } as GeolocationPositionError;
      
      setError(errorObject);
      setIsTracking(false);
      return;
    }

    setIsTracking(true);

    // Get initial position
    getCurrentPosition();

    if (watchPosition) {
      // Start watching position
      const id = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
      setWatchId(id);
    } else {
      // Use interval-based tracking instead
      const id = window.setInterval(() => {
        getCurrentPosition();
      }, trackingInterval);
      setIntervalId(id);
    }
  }, [getCurrentPosition, handleSuccess, handleError, watchPosition, trackingInterval]);

  const stopTracking = useCallback(() => {
    clearWatchPosition();
    clearTrackingInterval();
    setIsTracking(false);
  }, [clearWatchPosition, clearTrackingInterval]);

  // Helper to validate if we have valid location data
  const locationIsValid = useCallback(() => {
    return location !== null && 
      typeof location.latitude === 'number' && 
      typeof location.longitude === 'number';
  }, [location]);

  // Calculate how fresh the location data is
  const getLocationAge = useCallback(() => {
    if (!lastUpdated) return null;
    return Date.now() - lastUpdated.getTime();
  }, [lastUpdated]);

  // Check if location is stale (older than 2 minutes)
  const isLocationStale = useCallback(() => {
    const age = getLocationAge();
    return age !== null && age > 120000; // 2 minutes
  }, [getLocationAge]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearWatchPosition();
      clearTrackingInterval();
    };
  }, [clearWatchPosition, clearTrackingInterval]);

  return {
    position,
    error,
    isTracking,
    location,
    lastUpdated,
    getLocationAge,
    isLocationStale,
    startTracking,
    stopTracking,
    getCurrentPosition,
    getCurrentLocation,
    locationIsValid
  };
};
