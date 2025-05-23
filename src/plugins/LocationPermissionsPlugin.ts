
import { registerPlugin } from '@capacitor/core';

export type PermissionState = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';

export interface LocationPermissionStatus {
  location: PermissionState;
  backgroundLocation: PermissionState;
}

export interface LocationPermissionsPlugin {
  requestPermission(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus>;
  requestLocationPermission(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus>;
  checkPermissionStatus(): Promise<LocationPermissionStatus>;
}

// Exponential backoff state
const backoffState = {
  attemptCount: 0,
  lastAttemptTime: 0,
  throttled: false,
  bestLocation: null,
  maxAttempts: 3
};

// Create a safely initialized plugin with proper error handling
const createSafeLocationPermissions = () => {
  try {
    // Register the plugin with a web fallback
    return registerPlugin<LocationPermissionsPlugin>('LocationPermissions', {
      web: () => import('./web/LocationPermissionsWeb').then(m => m.LocationPermissionsWebInstance),
    });
  } catch (error) {
    console.error('Error initializing LocationPermissions plugin:', error);
    
    // Return a fallback implementation that won't crash the app
    return {
      requestPermission: async (options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> => {
        console.warn('LocationPermissions plugin not available, using fallback');
        return throttledPromiseWithGeolocation();
      },
      
      requestLocationPermission: async (options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> => {
        console.warn('LocationPermissions plugin not available, using fallback');
        return throttledPromiseWithGeolocation();
      },
      
      checkPermissionStatus: async (): Promise<LocationPermissionStatus> => {
        console.warn('LocationPermissions plugin not available, using fallback');
        // Default to prompt when plugin is unavailable
        return checkPermissionWithGeolocation();
      }
    } as LocationPermissionsPlugin;
  }
};

// Helper function to implement exponential backoff
const calculateBackoffDelay = (attempt: number): number => {
  // Base delay: 500ms, 1s, 2s, 4s, etc.
  const baseDelay = Math.pow(2, attempt - 1) * 500;
  
  // Add jitter (up to 25%) to prevent synchronized retries
  const jitter = Math.random() * (baseDelay * 0.25);
  
  // Cap at 10 seconds maximum
  return Math.min(baseDelay + jitter, 10000);
};

// Helper function to check if we should throttle
const shouldThrottle = (): boolean => {
  // If we've exceeded max attempts, throttle the request
  if (backoffState.attemptCount >= backoffState.maxAttempts) {
    return true;
  }
  
  // If less than 2 seconds have passed since the last attempt, throttle
  const now = Date.now();
  if (backoffState.lastAttemptTime > 0 && 
      now - backoffState.lastAttemptTime < calculateBackoffDelay(backoffState.attemptCount)) {
    return true;
  }
  
  return false;
};

// Helper function to check permission with standard geolocation API
const checkPermissionWithGeolocation = async (): Promise<LocationPermissionStatus> => {
  if (!navigator.geolocation) {
    return { location: 'prompt', backgroundLocation: 'prompt' };
  }
  
  try {
    if ('permissions' in navigator) {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return {
        location: status.state as PermissionState,
        backgroundLocation: 'prompt' as PermissionState
      };
    }
  } catch (e) {
    console.warn('Permission API not available, permission status unknown');
  }
  
  return { location: 'prompt', backgroundLocation: 'prompt' };
};

// Helper function to get permission using standard geolocation API with throttling
const throttledPromiseWithGeolocation = (): Promise<LocationPermissionStatus> => {
  return new Promise((resolve) => {
    // Check if we should throttle this request
    if (shouldThrottle()) {
      console.log('Throttling location request due to frequency or max attempts');
      
      // If we have a cached location permission result, use it
      if (backoffState.bestLocation) {
        console.log('Using cached location permission result');
        resolve(backoffState.bestLocation as LocationPermissionStatus);
        return;
      }
      
      // Otherwise, resolve with default prompt state
      resolve({ location: 'prompt', backgroundLocation: 'prompt' });
      return;
    }
    
    // Update backoff state
    backoffState.attemptCount++;
    backoffState.lastAttemptTime = Date.now();
    
    if (!navigator.geolocation) {
      resolve({ location: 'prompt', backgroundLocation: 'prompt' });
      return;
    }
    
    // Set a timeout for the geolocation request
    const timeoutId = setTimeout(() => {
      console.log('Location request timed out');
      
      // If we have a cached result, use it
      if (backoffState.bestLocation) {
        resolve(backoffState.bestLocation as LocationPermissionStatus);
      } else {
        resolve({ location: 'prompt', backgroundLocation: 'prompt' });
      }
    }, 10000);
    
    navigator.geolocation.getCurrentPosition(
      () => {
        clearTimeout(timeoutId);
        const result = { location: 'granted' as PermissionState, backgroundLocation: 'prompt' as PermissionState };
        backoffState.bestLocation = result; // Cache the successful result
        backoffState.attemptCount = 0; // Reset attempt count on success
        resolve(result);
      },
      (error) => {
        clearTimeout(timeoutId);
        if (error.code === 1) { // PERMISSION_DENIED
          const result = { location: 'denied' as PermissionState, backgroundLocation: 'denied' as PermissionState };
          backoffState.bestLocation = result; // Cache the result
          resolve(result);
        } else {
          // For other errors, we might want to keep trying
          if (backoffState.bestLocation) {
            resolve(backoffState.bestLocation as LocationPermissionStatus);
          } else {
            resolve({ location: 'prompt', backgroundLocation: 'prompt' });
          }
        }
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true } // Use a longer maximumAge to accept cached positions
    );
  });
};

// Helper function to get permission using standard geolocation API
const promiseWithGeolocation = (): Promise<LocationPermissionStatus> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ location: 'prompt', backgroundLocation: 'prompt' });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      () => resolve({ location: 'granted' as PermissionState, backgroundLocation: 'prompt' as PermissionState }),
      (error) => {
        if (error.code === 1) { // PERMISSION_DENIED
          resolve({ location: 'denied' as PermissionState, backgroundLocation: 'denied' as PermissionState });
        } else {
          resolve({ location: 'prompt' as PermissionState, backgroundLocation: 'prompt' as PermissionState });
        }
      },
      { timeout: 10000 }
    );
  });
};

// Reset backoff state - useful when permissions change externally
export const resetLocationBackoff = () => {
  backoffState.attemptCount = 0;
  backoffState.lastAttemptTime = 0;
  backoffState.throttled = false;
};

const LocationPermissions = createSafeLocationPermissions();

export default LocationPermissions;
