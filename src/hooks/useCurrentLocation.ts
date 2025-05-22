
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
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const fallbackToIpLocation = async (): Promise<DeliveryLocation> => {
    try {
      // This would normally call an IP geolocation API
      // For this example, we'll just return Austin, TX coordinates
      const result = {
        latitude: 30.2672,
        longitude: -97.7431,
        accuracy: 5000,  // IP geolocation is not very accurate
        timestamp: Date.now(),
        source: 'ip' as LocationSource,
      };
      
      setLocationSource('ip');
      return result;
    } catch (error) {
      console.error('IP Geolocation error:', error);
      throw new Error('Failed to get location from IP');
    }
  };

  const fallbackToCellLocation = async (): Promise<DeliveryLocation> => {
    try {
      // This would normally use cell tower triangulation
      // For this example, we'll just return Austin, TX coordinates with slight variation
      const result = {
        latitude: 30.2672 + (Math.random() * 0.01),
        longitude: -97.7431 + (Math.random() * 0.01),
        accuracy: 1000,  // Cell tower triangulation is somewhat accurate
        timestamp: Date.now(),
        source: 'cell' as LocationSource,
      };
      
      setLocationSource('cell');
      return result;
    } catch (error) {
      console.error('Cell location error:', error);
      throw new Error('Failed to get location from cell towers');
    }
  };

  const getCurrentLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    setIsLoadingLocation(true);
    setErrorMessage(null);

    try {
      // Try to get the location using the browser's geolocation API first
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
    } catch (gpsError) {
      // If GPS fails, try IP geolocation
      try {
        const ipLocation = await fallbackToIpLocation();
        setLastLocation(ipLocation);
        return ipLocation;
      } catch (ipError) {
        // If IP geolocation fails, try cell tower triangulation
        try {
          const cellLocation = await fallbackToCellLocation();
          setLastLocation(cellLocation);
          return cellLocation;
        } catch (cellError) {
          setErrorMessage('Could not determine your location. Please check your device settings.');
          return null;
        }
      }
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
