
import { useState, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { createDeliveryLocation } from '@/utils/locationConverters';
import { DeliveryLocation } from '@/types/location';

export function useCurrentLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
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
