
import { useState, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { createDeliveryLocation } from '@/utils/locationConverters';
import { DeliveryLocation } from '@/types/location';
import { Platform } from '@/utils/platform';
import { toast } from 'sonner';

export function useCurrentLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<DeliveryLocation | null>(null);

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
            toast.error('Geolocation not supported');
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
              setLastLocation(locationData);
              setIsLoading(false);
              resolve(locationData);
            },
            (err) => {
              console.error('Browser geolocation error:', err);
              
              let errorMessage = 'An unknown error occurred.';
              if (err.code === 1) {
                errorMessage = 'Permission denied. Please enable location in your browser settings.';
              } else if (err.code === 2) {
                errorMessage = 'Location information is unavailable.';
              } else if (err.code === 3) {
                errorMessage = 'The request to get user location timed out.';
              }
              
              setError(errorMessage);
              toast.error('Location error', { description: errorMessage });
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
      setLastLocation(locationData);
      setIsLoading(false);
      return locationData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      console.error('Error getting current location', err);
      setError(errorMessage);
      toast.error('Location error', { description: errorMessage });
      setIsLoading(false);
      return null;
    }
  }, []);

  return {
    getCurrentLocation,
    isLoadingLocation: isLoading,
    locationError: error,
    lastLocation
  };
}
