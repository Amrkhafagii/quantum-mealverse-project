
import { useState, useEffect, useCallback, useRef } from 'react';
import { DeliveryLocation } from '@/types/location';
import { Platform } from '@/utils/platform';

interface OptimizedLocationOptions {
  onLocationUpdate?: (location: DeliveryLocation) => void;
  onError?: (error: string) => void;
  maxAge?: number;
  enableHighAccuracy?: boolean;
  activityType?: 'driving' | 'walking' | 'still' | 'unknown';
  distanceFilter?: number;
  useCachedLocation?: boolean;
}

export function useOptimizedLocationTracking({
  onLocationUpdate,
  onError,
  maxAge = 30000,
  enableHighAccuracy = true,
  activityType = 'unknown',
  distanceFilter = 10,
  useCachedLocation = true
}: OptimizedLocationOptions = {}) {
  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastLocationTimestamp, setLastLocationTimestamp] = useState<number | null>(null);
  
  // Reference to the watchPosition ID
  const watchId = useRef<number | null>(null);
  // Reference to the interval ID for polling
  const pollingIntervalId = useRef<number | null>(null);
  // Previous location for distance filtering
  const prevLocation = useRef<{lat: number, lng: number} | null>(null);
  
  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  };
  
  // Adjust accuracy based on activity type
  const getAccuracySettings = useCallback(() => {
    switch (activityType) {
      case 'driving':
        return {
          enableHighAccuracy: false, // Less battery drain when driving
          interval: 5000,            // More frequent updates when driving
          distanceFilter: 30         // Larger distance filter when driving
        };
      case 'walking':
        return {
          enableHighAccuracy: true,  // Higher accuracy needed for walking
          interval: 10000,           // Less frequent updates when walking
          distanceFilter: 10         // Medium distance filter for walking
        };
      case 'still':
        return {
          enableHighAccuracy: false, // Low accuracy when still
          interval: 30000,           // Infrequent updates when still
          distanceFilter: 50         // Large filter when not moving
        };
      default:
        return {
          enableHighAccuracy,
          interval: 15000,           // Default interval
          distanceFilter
        };
    }
  }, [activityType, enableHighAccuracy, distanceFilter]);
  
  // Load cached location
  const loadCachedLocation = useCallback(() => {
    if (!useCachedLocation) return null;
    
    try {
      const cachedLocationStr = localStorage.getItem('cachedLocation');
      
      if (cachedLocationStr) {
        const cachedLocation = JSON.parse(cachedLocationStr);
        
        // Check if the cached location is recent enough
        if (Date.now() - cachedLocation.timestamp < maxAge) {
          return cachedLocation;
        }
      }
      
      return null;
    } catch (err) {
      console.error('Error loading cached location:', err);
      return null;
    }
  }, [maxAge, useCachedLocation]);
  
  // Get current position once
  const getCurrentPosition = useCallback(() => {
    return new Promise<DeliveryLocation | null>((resolve, reject) => {
      // First try to get a cached location if it's recent enough
      const cachedLocation = loadCachedLocation();
      
      if (cachedLocation) {
        setCurrentLocation(cachedLocation);
        setLastLocationTimestamp(cachedLocation.timestamp);
        
        if (onLocationUpdate) {
          onLocationUpdate(cachedLocation);
        }
        
        resolve(cachedLocation);
        return;
      }
      
      // Get current settings based on activity type
      const settings = getAccuracySettings();
      
      // Use browser geolocation API
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: DeliveryLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || undefined,
            isMoving: position.coords.speed !== null && position.coords.speed! > 0,
            source: 'gps'
          };
          
          // Only update if position has changed more than distanceFilter
          if (prevLocation.current) {
            const distance = calculateDistance(
              prevLocation.current.lat, 
              prevLocation.current.lng, 
              newLocation.latitude, 
              newLocation.longitude
            );
            
            if (distance < settings.distanceFilter) {
              resolve(currentLocation);
              return;
            }
          }
          
          // Update previous location
          prevLocation.current = { 
            lat: newLocation.latitude, 
            lng: newLocation.longitude 
          };
          
          // Cache the location
          try {
            localStorage.setItem('cachedLocation', JSON.stringify(newLocation));
          } catch (err) {
            console.error('Error caching location:', err);
          }
          
          setCurrentLocation(newLocation);
          setLastLocationTimestamp(newLocation.timestamp);
          setErrorMessage(null);
          
          if (onLocationUpdate) {
            onLocationUpdate(newLocation);
          }
          
          resolve(newLocation);
        },
        (error) => {
          const errorMsg = `Location error: ${error.message}`;
          setErrorMessage(errorMsg);
          
          if (onError) {
            onError(errorMsg);
          }
          
          reject(errorMsg);
        },
        {
          enableHighAccuracy: settings.enableHighAccuracy,
          timeout: 10000,
          maximumAge: maxAge
        }
      );
    });
  }, [currentLocation, getAccuracySettings, loadCachedLocation, maxAge, onError, onLocationUpdate]);
  
  // Start tracking location
  const startTracking = useCallback(() => {
    if (isTracking) return;
    
    // Get current settings based on activity type
    const settings = getAccuracySettings();
    
    // Get an initial position
    getCurrentPosition()
      .catch(err => console.error('Error getting initial position:', err));
    
    // If we're on a browser or don't have native geolocation, use polling
    if (!Platform.isNative()) {
      pollingIntervalId.current = window.setInterval(
        () => {
          getCurrentPosition()
            .catch(err => console.error('Error polling position:', err));
        },
        settings.interval
      ) as unknown as number;
      
      setIsTracking(true);
      return;
    }
    
    // On native platforms, try to use watchPosition
    try {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: DeliveryLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || undefined,
            isMoving: position.coords.speed !== null && position.coords.speed! > 0,
            source: 'gps'
          };
          
          // Only update if position has changed more than distanceFilter
          if (prevLocation.current) {
            const distance = calculateDistance(
              prevLocation.current.lat, 
              prevLocation.current.lng, 
              newLocation.latitude, 
              newLocation.longitude
            );
            
            if (distance < settings.distanceFilter) {
              return;
            }
          }
          
          // Update previous location
          prevLocation.current = { 
            lat: newLocation.latitude, 
            lng: newLocation.longitude 
          };
          
          // Cache the location
          try {
            localStorage.setItem('cachedLocation', JSON.stringify(newLocation));
          } catch (err) {
            console.error('Error caching location:', err);
          }
          
          setCurrentLocation(newLocation);
          setLastLocationTimestamp(newLocation.timestamp);
          setErrorMessage(null);
          
          if (onLocationUpdate) {
            onLocationUpdate(newLocation);
          }
        },
        (error) => {
          const errorMsg = `Location tracking error: ${error.message}`;
          setErrorMessage(errorMsg);
          
          if (onError) {
            onError(errorMsg);
          }
        },
        {
          enableHighAccuracy: settings.enableHighAccuracy,
          timeout: 10000,
          maximumAge: maxAge
        }
      );
      
      setIsTracking(true);
    } catch (err) {
      console.error('Error starting location tracking:', err);
      
      // Fall back to polling
      pollingIntervalId.current = window.setInterval(
        () => {
          getCurrentPosition()
            .catch(err => console.error('Error polling position:', err));
        },
        settings.interval
      ) as unknown as number;
      
      setIsTracking(true);
    }
  }, [getCurrentPosition, getAccuracySettings, isTracking, maxAge, onError, onLocationUpdate]);
  
  // Stop tracking location
  const stopTracking = useCallback(() => {
    if (!isTracking) return;
    
    // Clear watch position if active
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    
    // Clear polling interval if active
    if (pollingIntervalId.current !== null) {
      clearInterval(pollingIntervalId.current);
      pollingIntervalId.current = null;
    }
    
    setIsTracking(false);
  }, [isTracking]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);
  
  return {
    location: currentLocation,
    isTracking,
    error: errorMessage,
    lastUpdated: lastLocationTimestamp ? new Date(lastLocationTimestamp) : null,
    getCurrentPosition,
    startTracking,
    stopTracking
  };
}
