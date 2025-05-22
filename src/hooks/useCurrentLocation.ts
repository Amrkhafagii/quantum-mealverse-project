
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
      console.log('useCurrentLocation: Getting current location');
      
      // Special handling for web environment - use browser API directly
      if (Platform.isWeb()) {
        console.log('useCurrentLocation: Using browser geolocation API');
        return new Promise<DeliveryLocation | null>((resolve) => {
          if (!navigator.geolocation) {
            const errorMsg = 'Geolocation is not supported by this browser';
            console.error(errorMsg);
            setError(errorMsg);
            setIsLoading(false);
            resolve(null);
            return;
          }
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('useCurrentLocation: Browser geolocation successful');
              const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: position.timestamp || Date.now(),
                accuracy: position.coords.accuracy,
                speed: position.coords.speed || 0,
                isMoving: (position.coords.speed || 0) > 0.5
              };
              
              console.log('useCurrentLocation: Location data:', locationData);
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
      console.log('useCurrentLocation: Using Capacitor Geolocation');
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      
      console.log('useCurrentLocation: Capacitor geolocation successful', position);
      const locationData = createDeliveryLocation(position);
      setIsLoading(false);
      return locationData;
    } catch (err) {
      console.error('Error getting current location', err);
      setError('Failed to get location');
      setIsLoading(false);
      return null;
    }
  }, []);

  return {
    getCurrentLocation,
    isLoadingLocation: isLoading,
    locationError: error
  };
}
