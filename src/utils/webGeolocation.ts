
import { DeliveryLocation } from '@/types/location';

/**
 * Get location from browser's Geolocation API
 */
export const getBrowserLocation = async (): Promise<DeliveryLocation | null> => {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    throw new Error('Geolocation not supported by this browser');
  }
  
  try {
    // Implement a warm-up approach for browser geolocation
    // First get a quick fix with lower accuracy requirements
    const initialPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false, // First try without high accuracy for faster response
        timeout: 5000,
        maximumAge: 60000 // Accept a fairly recent cached position for initial fix
      });
    });
    
    // Log initial position for debugging
    console.log('Initial position acquired with accuracy:', initialPosition.coords.accuracy);
    
    // If the initial position has good enough accuracy, use it right away
    if (initialPosition.coords.accuracy <= 100) {
      console.log('Initial position has good accuracy, using it');
      // Format as DeliveryLocation and return
      return formatGeolocationPosition(initialPosition);
    }
    
    // If initial position doesn't have good accuracy, try again with high accuracy
    console.log('Initial position accuracy not sufficient, requesting high accuracy fix');
    
    // Get more accurate position
    const highAccuracyPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Want a fresh position for high accuracy
      });
    });
    
    console.log('High accuracy position acquired with accuracy:', highAccuracyPosition.coords.accuracy);
    
    // Format and return the high accuracy position
    return formatGeolocationPosition(highAccuracyPosition);
    
  } catch (error) {
    if ((error as GeolocationPositionError).code === 1) {
      throw new Error('Location permission denied');
    } else if ((error as GeolocationPositionError).code === 2) {
      throw new Error('Location unavailable');
    } else if ((error as GeolocationPositionError).code === 3) {
      throw new Error('Location request timed out');
    } else {
      throw error;
    }
  }
};

/**
 * Helper function to format GeolocationPosition as DeliveryLocation
 */
const formatGeolocationPosition = (position: GeolocationPosition): DeliveryLocation => {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    timestamp: position.timestamp,
    accuracy: position.coords.accuracy,
    altitude: position.coords.altitude || undefined,
    heading: position.coords.heading !== null ? position.coords.heading : undefined,
    speed: position.coords.speed !== null ? position.coords.speed : undefined,
    source: 'gps'
  };
};

/**
 * Watch location with progressive accuracy improvements
 */
export const watchBrowserLocation = (
  callback: (location: DeliveryLocation) => void,
  errorCallback?: (error: Error) => void
): () => void => {
  // Track how many updates we've received to implement warm-up
  let updateCount = 0;
  let initialWarmupComplete = false;
  
  // Start with lower accuracy for quicker initial fixes
  let options: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 30000
  };
  
  // Watch ID to clear the watch later
  let watchId: number;
  
  // Handler for position updates
  const handlePositionUpdate = (position: GeolocationPosition) => {
    updateCount++;
    
    // Convert to our location format
    const location = formatGeolocationPosition(position);
    
    // Call the callback with the location
    callback(location);
    
    // After 5 updates, switch to high accuracy if we're still getting poor accuracy
    if (updateCount === 5 && !initialWarmupComplete) {
      initialWarmupComplete = true;
      
      // If accuracy is still poor after 5 updates, restart with high accuracy
      if (position.coords.accuracy > 100) {
        console.log('Warm-up complete but accuracy still poor, switching to high accuracy mode');
        navigator.geolocation.clearWatch(watchId);
        
        // Restart with high accuracy
        options.enableHighAccuracy = true;
        options.maximumAge = 0;
        
        watchId = navigator.geolocation.watchPosition(
          handlePositionUpdate,
          handleError,
          options
        );
      } else {
        console.log('Warm-up complete with good accuracy');
      }
    }
  };
  
  // Error handler
  const handleError = (error: GeolocationPositionError) => {
    if (errorCallback) {
      let errorMessage = 'Unknown location error';
      
      if (error.code === 1) {
        errorMessage = 'Location permission denied';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out';
      }
      
      errorCallback(new Error(errorMessage));
    }
  };
  
  // Start watching position
  watchId = navigator.geolocation.watchPosition(
    handlePositionUpdate,
    handleError,
    options
  );
  
  // Return function to stop watching
  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
};

