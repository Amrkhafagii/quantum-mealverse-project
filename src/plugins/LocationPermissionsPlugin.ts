import { registerPlugin } from '@capacitor/core';
import { debounce, BatchCollector, BridgeStateCache } from '../utils/bridgeOptimization';

export type PermissionState = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';

export interface LocationPermissionStatus {
  location: PermissionState;
  backgroundLocation: PermissionState;
}

export interface LocationPermissionsPlugin {
  requestPermissions(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus>;
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

// Permission status cache to reduce bridge calls
const permissionStatusCache = new BridgeStateCache<LocationPermissionStatus>(60000); // 1 minute TTL

// Create a safely initialized plugin with proper error handling
const createSafeLocationPermissions = () => {
  try {
    console.log("Initializing LocationPermissions plugin");
    // Register the plugin with a web fallback
    const plugin = registerPlugin<LocationPermissionsPlugin>('LocationPermissions', {
      web: () => import('./web/LocationPermissionsWeb').then(m => m.LocationPermissionsWebInstance),
    });
    
    // Wrap original methods with optimized versions
    const originalRequestPermissions = plugin.requestPermissions.bind(plugin);
    const originalRequestLocationPermission = plugin.requestLocationPermission?.bind(plugin);
    const originalCheckPermissionStatus = plugin.checkPermissionStatus.bind(plugin);
    
    // Debounced version of checkPermissionStatus to prevent rapid calls
    const debouncedCheckStatus = debounce(async () => {
      const result = await originalCheckPermissionStatus();
      permissionStatusCache.set('status', result);
      return result;
    }, 500);
    
    // Override methods with optimized versions
    plugin.checkPermissionStatus = async () => {
      console.log("Calling plugin.checkPermissionStatus");
      // Try to use cached value first
      const cached = permissionStatusCache.get('status');
      if (cached) {
        console.log("Using cached permission status");
        return cached;
      }
      
      // Fall back to actual call
      console.log("Making bridge call to checkPermissionStatus");
      try {
        const result = await originalCheckPermissionStatus();
        console.log("checkPermissionStatus result:", result);
        permissionStatusCache.set('status', result);
        return result;
      } catch (error) {
        console.error("Error in checkPermissionStatus:", error);
        throw error;
      }
    };
    
    plugin.requestPermissions = async (options) => {
      console.log("Calling plugin.requestPermissions with options:", options);
      // Invalidate cache when requesting permissions
      permissionStatusCache.clear();
      try {
        const result = await originalRequestPermissions(options);
        console.log("requestPermissions result:", result);
        // Update cache with new permission status
        permissionStatusCache.set('status', result);
        return result;
      } catch (error) {
        console.error("Error in requestPermissions:", error);
        throw error;
      }
    };

    // Make requestLocationPermission call requestPermissions for consistency
    plugin.requestLocationPermission = async (options) => {
      console.log("Calling plugin.requestLocationPermission with options:", options);
      // Just forward to requestPermissions
      return plugin.requestPermissions(options);
    };
    
    return plugin;
  } catch (error) {
    console.error('Error initializing LocationPermissions plugin:', error);
    
    // Return a fallback implementation that won't crash the app
    return {
      requestPermissions: async (options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> => {
        console.warn('LocationPermissions plugin not available, using fallback');
        return throttledPromiseWithGeolocation();
      },
      
      requestLocationPermission: async (options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> => {
        console.warn('LocationPermissions.requestLocationPermission not available, using fallback');
        return throttledPromiseWithGeolocation();
      },
      
      checkPermissionStatus: async (): Promise<LocationPermissionStatus> => {
        console.warn('LocationPermissions.checkPermissionStatus not available, using fallback');
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

// Batch collector for location updates
const locationUpdateBatch = new BatchCollector<GeolocationPosition>({
  batchSize: 5,
  flushInterval: 3000, // 3 seconds
  onFlush: (positions) => {
    if (positions.length === 0) return;
    
    // Use the most recent position with best accuracy
    const bestPosition = positions.reduce((best, current) => {
      if (!best) return current;
      
      // Prefer more recent positions
      if (current.timestamp > best.timestamp + 5000) return current;
      
      // If timestamps are close, prefer more accurate positions
      return current.coords.accuracy < best.coords.accuracy ? current : best;
    }, positions[0]);
    
    // Process this position
    console.log('Processing batched location update with best position:', bestPosition);
    
    // Cache it for future use
    if (bestPosition) {
      backoffState.bestLocation = { 
        location: 'granted' as PermissionState, 
        backgroundLocation: 'prompt' as PermissionState 
      };
    }
  }
});

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
      (position) => {
        clearTimeout(timeoutId);
        
        // Add to batch collector instead of processing immediately
        locationUpdateBatch.add(position);
        
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
  
  // Also clear caches when resetting
  permissionStatusCache.clear();
  locationUpdateBatch.clear();
};

const LocationPermissions = createSafeLocationPermissions();

export default LocationPermissions;
