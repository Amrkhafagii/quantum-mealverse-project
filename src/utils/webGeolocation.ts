
import { UnifiedLocation } from '@/types/unifiedLocation';

/**
 * Get current location from browser geolocation API
 */
export async function getBrowserLocation(options?: PositionOptions): Promise<UnifiedLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UnifiedLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          source: 'gps'
        };
        
        resolve(location);
      },
      (error) => {
        let errorMessage = 'Unknown error occurred while retrieving location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options || {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Watch location changes using browser geolocation API
 */
export function watchBrowserLocation(
  callback: (location: UnifiedLocation) => void,
  errorCallback: (error: GeolocationPositionError) => void,
  options?: PositionOptions
): () => void {
  if (!navigator.geolocation) {
    errorCallback({
      code: 2,
      message: 'Geolocation is not supported by this browser',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    });
    return () => {};
  }
  
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location: UnifiedLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        source: 'gps'
      };
      
      callback(location);
    },
    errorCallback,
    options || {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
  
  // Return function to clear watch
  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

/**
 * Check if geolocation is supported
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Request geolocation permission
 */
export async function requestGeolocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { timeout: 5000 }
    );
  });
}
