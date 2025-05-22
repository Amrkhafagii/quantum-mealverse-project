
import { useState, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { createDeliveryLocation } from '@/utils/locationConverters';
import { DeliveryLocation } from '@/types/location';
import { Platform } from '@/utils/platform';

export function useCurrentLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Special handling for web environment - use browser API directly
      if (Platform.isWeb()) {
        return new Promise<DeliveryLocation | null>((resolve) => {
          if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser');
            setIsLoading(false);
            resolve(null);
            return;
          }
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: position.timestamp || Date.now(),
                accuracy: position.coords.accuracy,
                speed: position.coords.speed || 0,
                isMoving: (position.coords.speed || 0) > 0.5
              };
              
              setIsLoading(false);
              resolve(locationData);
            },
            (err) => {
              console.error('Browser geolocation error:', err);
              
              if (err.code === 1) {
                setError('Permission denied. Please enable location in your browser settings.');
              } else if (err.code === 2) {
                setError('Location information is unavailable.');
              } else if (err.code === 3) {
                setError('The request to get user location timed out.');
              } else {
                setError('An unknown error occurred.');
              }
              
              setIsLoading(false);
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });
      }
      
      // Standard Capacitor implementation for native platforms
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      
      const locationData = createDeliveryLocation(position);
      return locationData;
    } catch (err) {
      console.error('Error getting current location', err);
      setError('Failed to get location');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getCurrentLocation,
    isLoadingLocation: isLoading,
    locationError: error
  };
}
