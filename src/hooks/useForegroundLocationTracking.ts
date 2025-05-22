
import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { DeliveryLocation } from '@/types/location';

interface LocationOptions {
  watchPosition?: boolean;
  highAccuracy?: boolean;
  interval?: number;
  onLocationUpdate?: (location: DeliveryLocation) => void;
  onError?: (error: any) => void;
}

export function useForegroundLocationTracking({
  watchPosition = false,
  highAccuracy = true,
  interval = 10000,
  onLocationUpdate,
  onError
}: LocationOptions = {}) {
  const [currentPosition, setCurrentPosition] = useState<DeliveryLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const watchId = useRef<string | null>(null);

  // Convert Capacitor position to our DeliveryLocation format
  const formatPosition = (position: Position): DeliveryLocation => {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
      source: 'gps'
    };
  };

  // Get current position once
  const getCurrentPosition = async () => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: highAccuracy,
        timeout: 10000
      });
      
      const formattedPosition = formatPosition(position);
      setCurrentPosition(formattedPosition);
      setError(null);
      
      if (onLocationUpdate) {
        onLocationUpdate(formattedPosition);
      }
      
      return formattedPosition;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error getting location';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      console.error('Location error:', errorMessage);
      return null;
    }
  };

  // Start watching position
  const startTracking = async () => {
    if (watchId.current !== null) {
      return; // Already tracking
    }
    
    try {
      // First get current position
      await getCurrentPosition();
      
      // Then start watching
      if (watchPosition && Capacitor.isPluginAvailable('Geolocation')) {
        watchId.current = await Geolocation.watchPosition(
          {
            enableHighAccuracy: highAccuracy,
            timeout: 10000
          },
          (position, err) => {
            if (err) {
              if (onError) onError(err);
              setError(err.message);
              return;
            }
            
            if (position) {
              const formattedPosition = formatPosition(position);
              setCurrentPosition(formattedPosition);
              
              if (onLocationUpdate) {
                onLocationUpdate(formattedPosition);
              }
            }
          }
        );
        
        setIsTracking(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error starting location tracking';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      console.error('Location tracking error:', errorMessage);
    }
  };

  // Stop watching position
  const stopTracking = async () => {
    if (watchId.current === null) {
      return; // Not tracking
    }
    
    try {
      await Geolocation.clearWatch({ id: watchId.current });
      watchId.current = null;
      setIsTracking(false);
    } catch (err) {
      console.error('Error stopping location tracking:', err);
    }
  };

  // Start tracking on mount if watchPosition is true
  useEffect(() => {
    if (watchPosition) {
      startTracking();
    } else {
      getCurrentPosition();
    }
    
    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch({ id: watchId.current }).catch(console.error);
      }
    };
  }, [watchPosition]);

  // Handle interval updates if not watching position
  useEffect(() => {
    if (!watchPosition && interval > 0) {
      const intervalId = setInterval(getCurrentPosition, interval);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [watchPosition, interval]);

  return {
    position: currentPosition,
    error,
    isTracking,
    getCurrentPosition,
    startTracking,
    stopTracking
  };
}
