
import { useState, useEffect, useCallback } from 'react';
import { useLocationPermission } from './useLocationPermission';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export function useLocationTracker() {
  const {
    permissionStatus,
    requestPermission,
    isRequesting,
    location: permissionLocation,
    hasInitialized
  } = useLocationPermission();

  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Update location when permission location changes
  useEffect(() => {
    if (permissionLocation?.coords) {
      const newLocation = {
        latitude: permissionLocation.coords.latitude,
        longitude: permissionLocation.coords.longitude,
        timestamp: Date.now()
      };
      setLocation(newLocation);
      setLastUpdated(new Date());
      // Clear any previous errors when we get a valid location
      setError(null);
    }
  }, [permissionLocation]);

  // Improved location validation
  const locationIsValid = useCallback((): boolean => {
    if (!location) return false;
    
    const { latitude, longitude } = location;
    
    // Check for valid coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
    if (isNaN(latitude) || isNaN(longitude)) return false;
    if (latitude === 0 && longitude === 0) return false;
    
    // Check coordinate ranges
    if (latitude < -90 || latitude > 90) return false;
    if (longitude < -180 || longitude > 180) return false;
    
    return true;
  }, [location]);

  // Check if location is stale (older than 5 minutes)
  const isLocationStale = useCallback((): boolean => {
    if (!location || !location.timestamp) return true;
    
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return location.timestamp < fiveMinutesAgo;
  }, [location]);

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    // Reset error state
    setError(null);
    setIsGettingLocation(true);

    try {
      // If we don't have permission, request it
      if (permissionStatus !== 'granted') {
        console.log('Requesting location permission...');
        const granted = await requestPermission();
        if (!granted) {
          setError('Location permission denied. Please enable location access in your browser.');
          return null;
        }
      }

      // If we already have a valid, recent location, return it
      if (locationIsValid() && !isLocationStale()) {
        console.log('Using cached location');
        return location;
      }

      // Request fresh location
      console.log('Getting fresh location...');
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          setError('Geolocation is not supported by this browser');
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            };

            console.log('Got fresh location:', newLocation);
            setLocation(newLocation);
            setLastUpdated(new Date());
            setError(null);
            resolve(newLocation);
          },
          (error) => {
            console.error('Geolocation error:', error);
            let errorMessage = 'Could not get your location';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please enable location services.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable. Please try again.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out. Please try again.';
                break;
            }
            
            setError(errorMessage);
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
          }
        );
      });
    } catch (err) {
      console.error('Error in getCurrentLocation:', err);
      setError('An unexpected error occurred while getting your location');
      return null;
    } finally {
      setIsGettingLocation(false);
    }
  }, [permissionStatus, requestPermission, locationIsValid, isLocationStale, location]);

  // Start tracking location
  const startTracking = useCallback(() => {
    setIsTracking(true);
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Stop tracking location
  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  return {
    location,
    error,
    isGettingLocation: isGettingLocation || isRequesting,
    permissionStatus,
    getCurrentLocation,
    locationIsValid,
    isLocationStale,
    hasInitialized,
    isTracking,
    startTracking,
    stopTracking,
    lastUpdated
  };
}
