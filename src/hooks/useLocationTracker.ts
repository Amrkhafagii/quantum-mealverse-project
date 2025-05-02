
import { useState, useEffect, useCallback } from 'react';

interface LocationTrackerOptions {
  watchPosition?: boolean;
  trackingInterval?: number; // milliseconds
  onLocationUpdate?: (position: GeolocationPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
}

export const useLocationTracker = (options: LocationTrackerOptions = {}) => {
  const {
    watchPosition = true,
    trackingInterval = 10000, // Default to 10 seconds
    onLocationUpdate,
    onError
  } = options;

  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [intervalId, setIntervalId] = useState<number | null>(null);

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
      setError({
        code: 0,
        message: 'Geolocation not supported',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      });
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

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation not supported',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      });
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
    startTracking,
    stopTracking,
    getCurrentPosition
  };
};
