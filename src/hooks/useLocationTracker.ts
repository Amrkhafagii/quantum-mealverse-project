import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface LocationTrackerOptions {
  watchPosition?: boolean;
  trackingInterval?: number; // milliseconds
  onLocationUpdate?: (position: GeolocationPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
  showToasts?: boolean;
}

interface Location {
  latitude: number;
  longitude: number;
}

// Custom error that mimics GeolocationPositionError but can be created manually
interface CustomPositionError {
  code: number;
  message: string;
  PERMISSION_DENIED?: number;
  POSITION_UNAVAILABLE?: number;
  TIMEOUT?: number;
}

export const useLocationTracker = (options: LocationTrackerOptions = {}) => {
  const {
    watchPosition = true,
    trackingInterval = 15 * 60 * 1000, // Default to 15 minutes
    onLocationUpdate,
    onError,
    showToasts = true
  } = options;

  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<GeolocationPositionError | CustomPositionError | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const [isLoadingPosition, setIsLoadingPosition] = useState(false);

  // Check for cached location on initialization
  useEffect(() => {
    try {
      const cachedLocationString = localStorage.getItem('userLocation');
      if (cachedLocationString) {
        const cachedLocation = JSON.parse(cachedLocationString);
        if (cachedLocation?.latitude && cachedLocation?.longitude) {
          // Use cached location initially
          setLocation({
            latitude: cachedLocation.latitude,
            longitude: cachedLocation.longitude
          });
          // If timestamp is available, set lastUpdated
          if (cachedLocation.timestamp) {
            setLastUpdated(new Date(cachedLocation.timestamp));
          }
        }
      }
    } catch (error) {
      console.error('Error reading cached location:', error);
    }
  }, []);

  const clearWatchPosition = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const clearTrackingInterval = useCallback(() => {
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setPosition(pos);
    // Also set the simplified location object
    const newLocation = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    };
    setLocation(newLocation);
    setLastUpdated(new Date());
    setError(null);
    setIsLoadingPosition(false);
    
    // Cache location in localStorage
    try {
      localStorage.setItem('userLocation', JSON.stringify({
        ...newLocation,
        timestamp: new Date().getTime()
      }));
    } catch (error) {
      console.error('Error caching location:', error);
    }
    
    if (onLocationUpdate) {
      onLocationUpdate(pos);
    }
    
    if (showToasts) {
      toast.success("Location updated", {
        description: "Your location has been refreshed successfully",
        duration: 2000
      });
    }
  }, [onLocationUpdate, showToasts]);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setError(err);
    setIsLoadingPosition(false);
    
    if (showToasts) {
      // Show appropriate error message based on error code
      if (err.code === 1) { // PERMISSION_DENIED
        toast.error("Location access denied", {
          description: "Please enable location services in your browser settings"
        });
      } else if (err.code === 2) { // POSITION_UNAVAILABLE
        toast.error("Location unavailable", {
          description: "Could not detect your current location"
        });
      } else if (err.code === 3) { // TIMEOUT
        toast.error("Location request timed out", {
          description: "Please try again when you have a better connection"
        });
      }
    }
    
    if (onError) {
      onError(err);
    }
  }, [onError, showToasts]);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      // Create a custom error object instead of modifying a GeolocationPositionError
      const customError: CustomPositionError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Geolocation not supported',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };
      
      setError(customError);
      if (onError) {
        // Cast is needed since our custom error isn't exactly a GeolocationPositionError
        onError(customError as unknown as GeolocationPositionError);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [handleSuccess, handleError, onError]);

  // Check if permission is already granted
  const checkPermissionStatus = useCallback(async (): Promise<PermissionState | null> => {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setPermissionStatus(result.state);
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          setPermissionStatus(result.state);
        });

        return result.state;
      } catch (err) {
        console.error('Error checking permission:', err);
        return null;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  // Add a new method that returns a promise with the location
  const getCurrentLocation = useCallback((): Promise<Location | null> => {
    return new Promise((resolve, reject) => {
      setIsLoadingPosition(true);
      
      if (!navigator.geolocation) {
        // Create a custom error object instead of modifying a GeolocationPositionError
        const customError: CustomPositionError = {
          code: 2, // POSITION_UNAVAILABLE
          message: 'Geolocation not supported',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        };
        
        setError(customError);
        setIsLoadingPosition(false);
        reject(customError);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          setLocation(loc);
          setPosition(pos);
          setLastUpdated(new Date());
          setIsLoadingPosition(false);
          
          // Cache location in localStorage
          try {
            localStorage.setItem('userLocation', JSON.stringify({
              ...loc,
              timestamp: new Date().getTime()
            }));
          } catch (error) {
            console.error('Error caching location:', error);
          }
          
          resolve(loc);
        },
        (err) => {
          setError(err);
          setIsLoadingPosition(false);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      // Create a custom error object instead of modifying a GeolocationPositionError
      const customError: CustomPositionError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Geolocation not supported',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };
      
      setError(customError);
      setIsTracking(false);
      if (onError) {
        // Cast is needed since our custom error isn't exactly a GeolocationPositionError
        onError(customError as unknown as GeolocationPositionError);
      }
      return;
    }

    setIsTracking(true);

    // Get initial position
    getCurrentPosition();

    if (watchPosition) {
      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      // Use interval-based tracking instead
      intervalIdRef.current = window.setInterval(() => {
        getCurrentPosition();
      }, trackingInterval);
    }
  }, [getCurrentPosition, handleSuccess, handleError, watchPosition, trackingInterval, onError]);

  const stopTracking = useCallback(() => {
    clearWatchPosition();
    clearTrackingInterval();
    setIsTracking(false);
  }, [clearWatchPosition, clearTrackingInterval]);

  // Helper to validate if we have valid location data
  const locationIsValid = useCallback(() => {
    return location !== null && 
      typeof location.latitude === 'number' && 
      typeof location.longitude === 'number';
  }, [location]);

  // Calculate how fresh the location data is
  const getLocationAge = useCallback(() => {
    if (!lastUpdated) return null;
    return Date.now() - lastUpdated.getTime();
  }, [lastUpdated]);

  // Check if location is stale (older than 2 minutes)
  const isLocationStale = useCallback(() => {
    const age = getLocationAge();
    return age !== null && age > 120000; // 2 minutes
  }, [getLocationAge]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearWatchPosition();
      clearTrackingInterval();
    };
  }, [clearWatchPosition, clearTrackingInterval]);

  return {
    position,
    error,
    isTracking,
    location,
    lastUpdated,
    permissionStatus,
    isLoadingPosition,
    getLocationAge,
    isLocationStale,
    startTracking,
    stopTracking,
    getCurrentPosition,
    getCurrentLocation,
    locationIsValid,
    checkPermissionStatus
  };
};
