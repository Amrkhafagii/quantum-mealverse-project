
import { useState, useEffect, useCallback } from 'react';
import { DeliveryLocation } from '@/types/location';
import { useLocationPermission } from './useLocationPermission';
import { logLocationDebug } from '@/utils/locationDebug';

// Helper to extract a user-friendly message from GeolocationPositionError or Error objects
function parseGeolocationError(error: any): string {
  if (typeof window !== "undefined" && typeof window.GeolocationPositionError !== "undefined" && error instanceof window.GeolocationPositionError) {
    // Classic browser Geolocation error
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location access denied. Please enable location in your browser settings.";
      case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable. Try moving to an area with better connectivity.";
      case error.TIMEOUT:
        return "The request to get your location timed out. Please try again.";
      default:
        return error.message || 'Could not determine your location.';
    }
  }
  // Capacitor or structure-similar errors
  if (
    error && typeof error === 'object' &&
    (
      error.code === 1 || error.code === 2 || error.code === 3
    ) &&
    typeof error.message === "string"
  ) {
    switch (error.code) {
      case 1:
        return "Location access denied. Please enable location in your device/browser settings.";
      case 2:
        return "Your location is unavailable. Please check your connectivity.";
      case 3:
        return "Location request timed out. Please try again.";
      default:
        return error.message;
    }
  }
  // Error instance
  if (error instanceof Error) {
    return error.message;
  }
  // Fallback
  if (typeof error === 'string') return error;
  return 'Unable to retrieve location. Please try again.';
}

export const useLocationTracker = () => {
  const [location, setLocation] = useState<DeliveryLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { permissionStatus, requestPermission } = useLocationPermission();

  const locationIsValid = useCallback(() => {
    const isValid = location && 
      typeof location.latitude === 'number' && 
      typeof location.longitude === 'number' &&
      !isNaN(location.latitude) &&
      !isNaN(location.longitude);
    
    logLocationDebug('location-validity-check', { 
      context: { 
        isValid,
        location
      }
    });
    
    return !!isValid;
  }, [location]);

  // Check if location data is stale (older than 5 minutes)
  const isLocationStale = useCallback(() => {
    if (!location || !location.timestamp) return true;
    
    const staleThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = Date.now();
    const locationTime = location.timestamp;
    
    return (now - locationTime) > staleThreshold;
  }, [location]);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      logLocationDebug('get-current-position-start', {
        context: { permissionStatus }
      });
      
      if (permissionStatus !== 'granted') {
        const permissionGranted = await requestPermission();
        
        logLocationDebug('permission-request-result', {
          context: { 
            requested: true, 
            granted: permissionGranted,
            newStatus: permissionStatus
          }
        });
        
        if (!permissionGranted) {
          setError('Location permission denied');
          return null;
        }
      }

      return new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          position => {
            logLocationDebug('position-success', {
              context: { 
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy
                }
              }
            });
            resolve(position);
          },
          error => {
            logLocationDebug('position-error', { error });
            // Use our parser for user-friendly messages
            setError(parseGeolocationError(error));
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }).then(position => {
        const newLocation: DeliveryLocation = {
            latitude: parseFloat(position.coords.latitude.toString()), // Ensure double precision
            longitude: parseFloat(position.coords.longitude.toString()), // Ensure double precision
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
        
          source: 'gps',
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          altitude: position.coords.altitude || undefined
        };
        
        setLocation(newLocation);
        setLastUpdated(new Date());
        setError(null);
        
        return newLocation;
      });
    } catch (err) {
      logLocationDebug('get-current-position-exception', { error: err });
      setError(parseGeolocationError(err));
      return null;
    }
  }, [permissionStatus, requestPermission]);

  // Update location function
  const updateLocation = useCallback(async () => {
    try {
      const position = await getCurrentLocation();
      
      if (position) {
        const newLocation: DeliveryLocation = {
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
          timestamp: position.timestamp,
          source: 'gps',
          speed: position.speed || undefined,
          heading: position.heading || undefined,
          altitude: position.altitude || undefined
        };
        
        setLocation(newLocation);
        setLastUpdated(new Date());
        setError(null);
        
        logLocationDebug('location-updated', { location: newLocation });
        console.log('Location updated:', newLocation);
        
        localStorage.setItem('lastLocation', JSON.stringify({
          ...newLocation,
          updatedAt: new Date().toISOString()
        }));
        
        return newLocation;
      }
      return null;
    } catch (err) {
      setError(parseGeolocationError(err));
      logLocationDebug('update-location-error', { error: err });
      console.error('Error updating location:', err);
      return null;
    }
  }, [getCurrentLocation]);

  // Start tracking location
  const startTracking = useCallback(() => {
    if (isTracking) return;
    setIsTracking(true);
    
    // Update location immediately
    updateLocation();
    
    // Set interval to update location periodically
    const intervalId = setInterval(updateLocation, 60000); // Every minute
    
    return () => {
      clearInterval(intervalId);
      setIsTracking(false);
    };
  }, [isTracking, updateLocation]);

  // Stop tracking location
  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  // Initialize tracking
  useEffect(() => {
    // Try to load from local storage first
    try {
      const savedLocation = localStorage.getItem('lastLocation');
      if (savedLocation) {
        const parsedLocation = JSON.parse(savedLocation);
        // Check if the saved location is relatively recent (less than 30 minutes old)
        const savedTime = new Date(parsedLocation.updatedAt).getTime();
        const now = Date.now();
        const thirtyMinutesMs = 30 * 60 * 1000;
        
        if (now - savedTime < thirtyMinutesMs) {
          setLocation(parsedLocation);
          setLastUpdated(new Date(parsedLocation.updatedAt));
          logLocationDebug('loaded-cached-location', { 
            location: parsedLocation,
            context: {
              ageMs: now - savedTime
            } 
          });
          console.log('Loaded cached location:', parsedLocation);
        } else {
          logLocationDebug('cached-location-expired', { 
            context: {
              savedLocation: parsedLocation,
              ageMs: now - savedTime
            } 
          });
          console.log('Cached location is too old, will request fresh location');
          // Still set it temporarily but will refresh
          setLocation(parsedLocation);
          setLastUpdated(new Date(parsedLocation.updatedAt));
          // We'll trigger an update below
        }
      }
    } catch (err) {
      console.error('Error loading cached location:', err);
      logLocationDebug('cached-location-error', { error: err });
    }
    
    // Always try to get a fresh location on component mount
    if (permissionStatus === 'granted') {
      updateLocation();
    }
  }, [permissionStatus, updateLocation]);

  // Start tracking when permission is granted
  useEffect(() => {
    if (permissionStatus === 'granted' && !isTracking) {
      const cleanup = startTracking();
      
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [permissionStatus, isTracking, startTracking]);

  return {
    location,
    updateLocation,
    isTracking,
    error,
    locationIsValid,
    isLocationStale,
    lastUpdated,
    getCurrentLocation: updateLocation,
    permissionStatus,
    startTracking,
    stopTracking
  };
};
