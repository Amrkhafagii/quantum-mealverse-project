
import { WebPlugin } from '@capacitor/core';
import type { LocationPermissionsPlugin, LocationPermissionStatus, PermissionState } from '../LocationPermissionsPlugin';
import { debounce, BridgeStateCache } from '../../utils/bridgeOptimization';

// Store the best location result
let bestLocationResult: LocationPermissionStatus | null = null;
let lastRequestTime = 0;
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 5;
const THROTTLE_RESET_TIME = 60000; // 1 minute

// Web-specific caching to reduce geolocation API calls
const webLocationCache = new BridgeStateCache<LocationPermissionStatus>(120000); // 2 minute TTL for web

export class LocationPermissionsWeb extends WebPlugin implements LocationPermissionsPlugin {
  private pendingRequests: Array<{ 
    resolve: (value: LocationPermissionStatus) => void, 
    options: { includeBackground?: boolean } 
  }> = [];
  
  // Use debounced version for actual implementation to reduce simultaneous calls
  private debouncedRequestImplementation = debounce(async () => {
    if (this.pendingRequests.length === 0) return;
    
    try {
      // Process all pending requests with a single geolocation call
      const result = await this.performLocationRequest();
      
      // Resolve all pending requests with the same result
      this.pendingRequests.forEach(({ resolve }) => {
        resolve(result);
      });
      
      // Clear pending requests
      this.pendingRequests = [];
    } catch (error) {
      console.error('Error in debounced location request:', error);
      
      // Resolve all with fallback in case of error
      const fallback = bestLocationResult || { 
        location: 'prompt' as PermissionState, 
        backgroundLocation: 'prompt' as PermissionState 
      };
      
      this.pendingRequests.forEach(({ resolve }) => {
        resolve(fallback);
      });
      
      // Clear pending requests
      this.pendingRequests = [];
    }
  }, 200);
  
  async requestPermission(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> {
    return this.requestLocationPermission(options);
  }
  
  async requestLocationPermission(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> {
    console.log('Web implementation of requestLocationPermission');
    
    // Check cache first
    const cacheKey = 'location_permission';
    const cached = webLocationCache.get(cacheKey);
    if (cached && cached.location === 'granted') {
      console.log('Using cached permission result:', cached);
      return cached;
    }
    
    // Check if we should throttle
    const now = Date.now();
    if (now - lastRequestTime > THROTTLE_RESET_TIME) {
      // It's been more than a minute, reset the counter
      requestCount = 0;
    }
    
    // Increment the counter
    requestCount++;
    lastRequestTime = now;
    
    // If we've exceeded the max requests and have a cached result, use it
    if (requestCount > MAX_REQUESTS_PER_MINUTE && bestLocationResult) {
      console.log('Throttling location requests, using cached result');
      return bestLocationResult;
    }
    
    return new Promise((resolve) => {
      // Queue this request
      this.pendingRequests.push({ resolve, options });
      
      // Trigger the debounced implementation
      this.debouncedRequestImplementation();
    });
  }

  private async performLocationRequest(): Promise<LocationPermissionStatus> {
    try {
      // For web, try to request permission using the Geolocation API
      if (navigator && navigator.geolocation) {
        return new Promise((resolve) => {
          // Set a timeout in case the geolocation API takes too long
          const timeoutId = setTimeout(() => {
            console.log('Geolocation request timed out');
            // If we have a cached result, use it
            if (bestLocationResult) {
              resolve(bestLocationResult);
            } else {
              resolve({ location: 'prompt' as PermissionState, backgroundLocation: 'prompt' as PermissionState });
            }
          }, 10000);
          
          navigator.geolocation.getCurrentPosition(
            () => {
              clearTimeout(timeoutId);
              const result = { location: 'granted' as PermissionState, backgroundLocation: 'prompt' as PermissionState };
              bestLocationResult = result; // Cache the successful result
              webLocationCache.set('location_permission', result);
              resolve(result);
            },
            (error) => {
              clearTimeout(timeoutId);
              console.log('Geolocation permission error:', error);
              
              if (error.code === error.PERMISSION_DENIED) {
                const result = { location: 'denied' as PermissionState, backgroundLocation: 'denied' as PermissionState };
                bestLocationResult = result;
                webLocationCache.set('location_permission', result);
                resolve(result);
              } else {
                // For non-permission errors, check if we have a cached result
                if (bestLocationResult) {
                  resolve(bestLocationResult);
                } else {
                  resolve({ location: 'prompt' as PermissionState, backgroundLocation: 'prompt' as PermissionState });
                }
              }
            },
            { 
              timeout: 10000, 
              maximumAge: 180000, // Accept positions up to 3 minutes old
              enableHighAccuracy: false // Start with lower accuracy for faster response
            }
          );
        });
      }
      
      // Fall back to default response
      return { location: 'prompt' as PermissionState, backgroundLocation: 'prompt' as PermissionState };
    } catch (error) {
      console.error('Error in web implementation of requestLocationPermission:', error);
      
      // If we have a cached result from a previous successful attempt, use it
      if (bestLocationResult) {
        return bestLocationResult;
      }
      
      return { location: 'prompt' as PermissionState, backgroundLocation: 'prompt' as PermissionState };
    }
  }

  async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    console.log('Web implementation of checkPermissionStatus');
    
    // Check cache first
    const cacheKey = 'location_permission_status';
    const cached = webLocationCache.get(cacheKey);
    if (cached) {
      console.log('Using cached permission status:', cached);
      return cached;
    }
    
    try {
      // If we have a cached result from a previous check, use it
      if (bestLocationResult) {
        return bestLocationResult;
      }
      
      if (navigator && navigator.permissions) {
        try {
          const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          
          if (status.state === 'granted') {
            bestLocationResult = { location: 'granted' as PermissionState, backgroundLocation: 'prompt' as PermissionState };
            webLocationCache.set(cacheKey, bestLocationResult);
            return bestLocationResult;
          } else if (status.state === 'denied') {
            bestLocationResult = { location: 'denied' as PermissionState, backgroundLocation: 'denied' as PermissionState };
            webLocationCache.set(cacheKey, bestLocationResult);
            return bestLocationResult;
          }
          
          // For 'prompt' state, try a low-accuracy location request to verify
          if (navigator.geolocation) {
            try {
              await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                  resolve,
                  reject,
                  { timeout: 5000, maximumAge: 300000, enableHighAccuracy: false }
                );
              });
              
              // If successful, permission is granted
              bestLocationResult = { location: 'granted' as PermissionState, backgroundLocation: 'prompt' as PermissionState };
              webLocationCache.set(cacheKey, bestLocationResult);
              return bestLocationResult;
            } catch (e) {
              // If this fails, the permission is likely denied
              if (e instanceof GeolocationPositionError && e.code === e.PERMISSION_DENIED) {
                bestLocationResult = { location: 'denied' as PermissionState, backgroundLocation: 'denied' as PermissionState };
                webLocationCache.set(cacheKey, bestLocationResult);
                return bestLocationResult;
              }
              // Otherwise it's likely still in the prompt state
            }
          }
        } catch (e) {
          console.warn('Permission API error:', e);
        }
      }
      
      const result = { location: 'prompt' as PermissionState, backgroundLocation: 'prompt' as PermissionState };
      webLocationCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in web implementation of checkPermissionStatus:', error);
      return { location: 'prompt' as PermissionState, backgroundLocation: 'prompt' as PermissionState };
    }
  }
}

export const LocationPermissionsWebInstance = new LocationPermissionsWeb();
