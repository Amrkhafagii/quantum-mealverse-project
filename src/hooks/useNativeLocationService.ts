
import { useState, useEffect, useCallback } from 'react';
import { useLocationPermissions } from './useLocationPermissions';
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';

// Option types for the hook
interface NativeLocationOptions {
  watchPosition?: boolean;
  highAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// Result type for location service
interface LocationResult {
  position: Position | null;
  error: Error | null;
  isLoading: boolean;
  isWatching: boolean;
}

export function useNativeLocationService(options: NativeLocationOptions = {}) {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState<string | null>(null);
  const locationPermissions = useLocationPermissions();
  const { permissionStatus } = locationPermissions;

  // Default options
  const {
    watchPosition = false,
    highAccuracy = true,
    timeout = 10000,
    maximumAge = 0
  } = options;

  // Get current position once
  const getCurrentPosition = useCallback(async () => {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      setError(new Error('Geolocation is not available on this device'));
      return;
    }

    if (permissionStatus !== 'granted') {
      try {
        await locationPermissions.requestPermission();
      } catch (err) {
        setError(new Error('Location permission not granted'));
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge
      });
      
      setPosition(position);
      return position;
    } catch (err) {
      setError(err as Error);
      console.error('Error getting location:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [permissionStatus, locationPermissions, highAccuracy, timeout, maximumAge]);

  // Start watching position
  const startWatchingPosition = useCallback(async () => {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      setError(new Error('Geolocation is not available on this device'));
      return;
    }

    if (permissionStatus !== 'granted') {
      try {
        await locationPermissions.requestPermission();
      } catch (err) {
        setError(new Error('Location permission not granted'));
        return;
      }
    }

    if (isWatching) {
      console.log('Already watching position');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const id = await Geolocation.watchPosition(
        {
          enableHighAccuracy: highAccuracy,
          timeout,
          maximumAge
        },
        (position, err) => {
          if (err) {
            setError(err);
            return;
          }
          setPosition(position);
          setIsLoading(false);
        }
      );
      
      setWatchId(id);
      setIsWatching(true);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      console.error('Error starting location watch:', err);
    }
  }, [permissionStatus, locationPermissions, highAccuracy, timeout, maximumAge, isWatching]);

  // Stop watching position
  const stopWatchingPosition = useCallback(() => {
    if (watchId !== null) {
      Geolocation.clearWatch({ id: watchId });
      setWatchId(null);
      setIsWatching(false);
    }
  }, [watchId]);

  // Start watching if watchPosition is true
  useEffect(() => {
    if (watchPosition && !isWatching && permissionStatus === 'granted') {
      startWatchingPosition();
    }
    
    return () => {
      if (watchId !== null) {
        stopWatchingPosition();
      }
    };
  }, [watchPosition, permissionStatus, startWatchingPosition, stopWatchingPosition, isWatching, watchId]);

  return {
    position,
    error,
    isLoading,
    isWatching,
    getCurrentPosition,
    startWatchingPosition,
    stopWatchingPosition
  } as LocationResult & {
    getCurrentPosition: () => Promise<Position | null>;
    startWatchingPosition: () => Promise<void>;
    stopWatchingPosition: () => void;
  };
}
