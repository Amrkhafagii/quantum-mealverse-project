
import { useState, useEffect, useCallback } from 'react';
import { DeliveryLocation, LocationSource } from '@/types/location';

export function useCurrentLocation() {
  const [lastLocation, setLastLocation] = useState<DeliveryLocation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [locationSource, setLocationSource] = useState<LocationSource>('manual');

  const getPositionFromNavigator = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
          setLocationSource('gps');
        },
        (error) => {
          console.error('Geolocation error:', error);
          
          // Specific error messaging based on error code
          switch(error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location access denied. Please enable location services in your browser settings.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable. Please try again in a different area.'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out. Please check your GPS signal and try again.'));
              break;
            default:
              reject(new Error('An unknown error occurred while retrieving your location.'));
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  };

  const getCurrentLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    setIsLoadingLocation(true);
    setErrorMessage(null);

    try {
      // Get the location using the browser's geolocation API
      const position = await getPositionFromNavigator();
      
      const location: DeliveryLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        speed: position.coords.speed || undefined,
        altitude: position.coords.altitude || undefined,
        heading: position.coords.heading || undefined,
        source: 'gps'
      };
      
      setLastLocation(location);
      return location;
    } catch (error: any) {
      console.error('Location retrieval failed:', error);
      setErrorMessage(error.message || 'Could not get your location. Please check your device settings.');
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  // Try to get the location when the component mounts
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    lastLocation,
    isLoadingLocation,
    locationError: errorMessage,
    locationSource,
    getCurrentLocation
  };
}
