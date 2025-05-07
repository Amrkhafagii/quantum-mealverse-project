
import { useState, useEffect, useCallback } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/components/ui/use-toast';
import { DeliveryLocation } from '@/types/location';

// Register the BackgroundGeolocation plugin
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

export const useNativeLocationService = (options: {
  backgroundTracking?: boolean;
  trackingInterval?: number;
}) => {
  const {
    backgroundTracking = false,
    trackingInterval = 10000, // 10 seconds default
  } = options;
  
  const [location, setLocation] = useState<DeliveryLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Check permission status on load
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permission = await Geolocation.checkPermissions();
        // Handle possible values from Capacitor
        if (permission.location === 'granted') {
          setPermissionStatus('granted');
        } else if (permission.location === 'denied') {
          setPermissionStatus('denied');
        } else {
          setPermissionStatus('prompt');
        }
      } catch (err) {
        console.error('Error checking location permissions', err);
      }
    };
    
    checkPermissions();
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const permission = await Geolocation.requestPermissions();
      // Handle possible values from Capacitor
      if (permission.location === 'granted') {
        setPermissionStatus('granted');
        return true;
      } else {
        setPermissionStatus('denied');
        return false;
      }
    } catch (err) {
      console.error('Error requesting location permissions', err);
      return false;
    }
  }, []);

  // Function to convert Position to our DeliveryLocation type
  const createDeliveryLocation = (position: Position): DeliveryLocation => {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
  };

  // Get current location once
  const getCurrentLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    try {
      if (permissionStatus !== 'granted') {
        const granted = await requestPermissions();
        if (!granted) {
          setError('Location permission not granted');
          return null;
        }
      }
      
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      
      const locationData = createDeliveryLocation(position);
      setLocation(locationData);
      setLastUpdated(new Date());
      setError(null);
      
      return locationData;
    } catch (err) {
      console.error('Error getting current location', err);
      setError('Failed to get location');
      return null;
    }
  }, [permissionStatus, requestPermissions]);

  // Start tracking location with appropriate method based on platform and settings
  const startTracking = useCallback(async () => {
    if (permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) {
        setError('Location permission not granted');
        return false;
      }
    }
    
    try {
      // If we're on a native platform and background tracking is enabled
      if (Capacitor.isNativePlatform()) {
        if (backgroundTracking) {
          // Use background geolocation for more efficient background tracking
          await BackgroundGeolocation.addWatcher(
            {
              backgroundMessage: "Quantum Mealverse is tracking your location for delivery",
              backgroundTitle: "Location Tracking Active",
              requestPermissions: true,
              stale: false,
              distanceFilter: 10, // minimum distance in meters
              stopOnTerminate: false,
              startOnBoot: true,
            },
            (position, err) => {
              if (err) {
                console.error(err);
                return;
              }
              
              if (position) {
                const locationData: DeliveryLocation = {
                  latitude: position.latitude,
                  longitude: position.longitude,
                  accuracy: position.accuracy,
                  timestamp: Date.now(),
                };
                
                setLocation(locationData);
                setLastUpdated(new Date());
              }
            }
          );
        } else {
          // Use regular geolocation for foreground tracking
          const watchId = await Geolocation.watchPosition(
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 3000,
            },
            (position) => {
              if (!position) return;
              
              const locationData = createDeliveryLocation(position);
              setLocation(locationData);
              setLastUpdated(new Date());
            }
          );
          
          // Save the watch ID for cleanup
          (window as any).nativeWatchId = watchId;
        }
      } else {
        // Fallback for web: use regular geolocation via the web API
        if ('geolocation' in navigator) {
          const watchId = navigator.geolocation.watchPosition(
            (position) => {
              const locationData: DeliveryLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
              };
              
              setLocation(locationData);
              setLastUpdated(new Date());
            },
            (err) => {
              console.error('Error watching position', err);
              setError(`Geolocation error: ${err.message}`);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 3000,
            }
          );
          
          // Save the watch ID for cleanup
          (window as any).webWatchId = watchId;
        }
      }
      
      setIsTracking(true);
      setError(null);
      
      // Get an initial location
      await getCurrentLocation();
      
      return true;
    } catch (err) {
      console.error('Error starting location tracking', err);
      setError('Failed to start location tracking');
      setIsTracking(false);
      
      toast({
        title: "Location tracking failed",
        description: "Could not start tracking your location. Please check your settings.",
        variant: "destructive"
      });
      
      return false;
    }
  }, [permissionStatus, requestPermissions, backgroundTracking, getCurrentLocation]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        if (backgroundTracking) {
          await BackgroundGeolocation.removeWatcher({
            id: (window as any).backgroundWatcherId
          });
        } else if ((window as any).nativeWatchId) {
          await Geolocation.clearWatch({ id: (window as any).nativeWatchId });
        }
      } else if ((window as any).webWatchId) {
        navigator.geolocation.clearWatch((window as any).webWatchId);
      }
      
      setIsTracking(false);
      
      return true;
    } catch (err) {
      console.error('Error stopping location tracking', err);
      return false;
    }
  }, [backgroundTracking]);

  return {
    location,
    error,
    isTracking,
    permissionStatus,
    lastUpdated,
    getCurrentLocation,
    startTracking,
    stopTracking,
    requestPermissions
  };
};
