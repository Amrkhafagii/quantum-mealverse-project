
import { useState, useEffect, useCallback } from 'react';
import { DeliveryLocation } from '@/types/location';
import { useLocationPermission } from './useLocationPermission';
import { logLocationDebug } from '@/utils/locationDebug';

export const useLocationTracker = () => {
  const [location, setLocation] = useState<DeliveryLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
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

  // Get current location
  const getCurrentPosition = useCallback(async () => {
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
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      });
    } catch (err) {
      logLocationDebug('get-current-position-exception', { error: err });
      setError(err instanceof Error ? err.message : 'Unknown error getting location');
      return null;
    }
  }, [permissionStatus, requestPermission]);

  // Update location function
  const updateLocation = useCallback(async () => {
    try {
      const position = await getCurrentPosition();
      
      if (position) {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          source: 'gps'
        };
        
        setLocation(newLocation);
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
      setError(err instanceof Error ? err.message : 'Unknown error updating location');
      logLocationDebug('update-location-error', { error: err });
      console.error('Error updating location:', err);
      return null;
    }
  }, [getCurrentPosition]);

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
      setIsTracking(true);
      updateLocation();
      
      // Set up periodic location updates - every minute
      const intervalId = setInterval(updateLocation, 60000);
      
      return () => {
        clearInterval(intervalId);
        setIsTracking(false);
      };
    }
  }, [permissionStatus, isTracking, updateLocation]);

  return {
    location,
    updateLocation,
    isTracking,
    error,
    locationIsValid,
  };
};
