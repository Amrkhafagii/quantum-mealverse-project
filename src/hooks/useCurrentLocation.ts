
import { useState, useEffect, useCallback } from 'react';
import { DeliveryLocation, LocationSource } from '@/types/location';
import { getUnifiedCurrentLocation, requestLocationPermission } from '@/utils/unifiedGeolocation';

export function useCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation | null>(null);
  const [lastLocation, setLastLocation] = useState<DeliveryLocation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [locationSource, setLocationSource] = useState<LocationSource>('manual');

  const getCurrentLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    setIsLoading(true);
    setIsLoadingLocation(true);
    setErrorMessage(null);

    try {
      const permission = await requestLocationPermission();
      if (permission !== 'granted') {
        setErrorMessage('Location permission denied. Please enable location access in your device settings.');
        setIsLoading(false);
        setIsLoadingLocation(false);
        return null;
      }

      const location = await getUnifiedCurrentLocation();
      if (!location) throw new Error('Could not get your location');
      setCurrentLocation(location);
      setLastLocation(location);
      setLocationSource(location.source || 'gps');
      return location;
    } catch (e: any) {
      setErrorMessage(e?.message || 'Could not get your location. Please check your device settings.');
      return null;
    } finally {
      setIsLoading(false);
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    currentLocation,
    lastLocation,
    isLoading,
    isLoadingLocation,
    locationError: errorMessage,
    locationSource,
    getCurrentLocation
  };
}
