
import { WebPlugin } from '@capacitor/core';
import type { LocationPermissionsPlugin, LocationPermissionStatus, PermissionState } from '../LocationPermissionsPlugin';

export class LocationPermissionsWeb extends WebPlugin implements LocationPermissionsPlugin {
  constructor() {
    super({
      name: 'LocationPermissions'
    });
  }

  /**
   * Check browser location permission status with detailed errors
   */
  async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    try {
      console.log('Web: Checking location permission status');
      
      // Check if geolocation is available in this browser
      if (!navigator.geolocation) {
        console.error('Web: Geolocation API not available in this browser');
        return {
          location: 'denied' as PermissionState,
          backgroundLocation: 'denied' as PermissionState
        };
      }
      
      // Check permissions API if available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          
          let status: PermissionState;
          switch (permission.state) {
            case 'granted':
              status = 'granted';
              break;
            case 'denied':
              status = 'denied';
              break;
            default:
              status = 'prompt';
          }
          
          console.log(`Web: Permission status determined via Permissions API: ${status}`);
          
          return {
            location: status,
            backgroundLocation: 'denied' // Background location not supported on web
          };
        } catch (permError) {
          console.warn('Web: Error using Permissions API, falling back to permission inference', permError);
        }
      }
      
      // If Permissions API unavailable or failed, we'll need to infer status
      console.log('Web: Using permission inference method');
      return {
        location: 'prompt', // We can't know for sure without requesting
        backgroundLocation: 'denied' // Background location not supported on web
      };
    } catch (error) {
      console.error('Web: Error checking permission status', error);
      throw new Error(`Failed to check location permission: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Request browser location permission with detailed error messages
   */
  async requestPermissions(options: { includeBackground?: boolean } = {}): Promise<LocationPermissionStatus> {
    try {
      console.log('Web: Requesting location permissions with options:', options);
      
      if (!navigator.geolocation) {
        throw new Error('Geolocation API is not supported in this browser');
      }
      
      // Try to request position to trigger the browser permission prompt
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          // Success callback - permission granted
          () => {
            console.log('Web: Location permission granted');
            resolve({
              location: 'granted' as PermissionState,
              backgroundLocation: 'denied' as PermissionState // Web doesn't support background location
            });
          },
          // Error callback - permission denied or error
          (error) => {
            console.log(`Web: Location permission error: ${error.code} - ${error.message}`);
            
            // Handle different error codes with detailed messages
            if (error.code === 1) { // PERMISSION_DENIED
              resolve({
                location: 'denied' as PermissionState,
                backgroundLocation: 'denied' as PermissionState
              });
            } else if (error.code === 2) { // POSITION_UNAVAILABLE
              reject(new Error('Location information is unavailable. Please try again in a different area.'));
            } else if (error.code === 3) { // TIMEOUT
              reject(new Error('The request to get your location timed out. Please try again.'));
            } else {
              reject(new Error(`An unknown error occurred: ${error.message}`));
            }
          },
          // Options
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });
    } catch (error) {
      console.error('Web: Error requesting permissions', error);
      throw new Error(`Failed to request location permission: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Forward to requestPermissions for compatibility
   */
  async requestLocationPermission(options: { includeBackground?: boolean } = {}): Promise<LocationPermissionStatus> {
    return this.requestPermissions(options);
  }
}

// Export a single instance for the plugin to use
export const LocationPermissionsWebInstance = new LocationPermissionsWeb();
