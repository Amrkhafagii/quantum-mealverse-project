
import { WebPlugin } from '@capacitor/core';
import { LocationPermissionStatus, LocationPermissionsPlugin } from '../LocationPermissionsPlugin';

export class LocationPermissionsWeb extends WebPlugin implements LocationPermissionsPlugin {
  constructor() {
    super();
    // No need to pass configuration object in newer Capacitor versions
  }

  async requestLocationPermission(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> {
    console.log('Web implementation: requestLocationPermission', options);
    
    try {
      if ('permissions' in navigator) {
        // Modern browsers implementation using Permissions API
        const status = await navigator.permissions.query({ name: 'geolocation' });
        
        return {
          location: status.state as 'granted' | 'denied' | 'prompt',
          backgroundLocation: 'prompt' // Background location not applicable on web
        };
      } else {
        // Fallback for browsers without Permissions API
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve({ location: 'granted', backgroundLocation: 'prompt' }),
            () => resolve({ location: 'denied', backgroundLocation: 'denied' }),
            { timeout: 10000 }
          );
        });
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return { location: 'prompt', backgroundLocation: 'prompt' };
    }
  }

  async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    console.log('Web implementation: checkPermissionStatus');
    
    try {
      if ('permissions' in navigator) {
        // Modern browsers implementation using Permissions API
        const status = await navigator.permissions.query({ name: 'geolocation' });
        
        return {
          location: status.state as 'granted' | 'denied' | 'prompt',
          backgroundLocation: 'prompt' // Background location not applicable on web
        };
      } else {
        // No way to check without prompting on older browsers
        return { location: 'prompt', backgroundLocation: 'prompt' };
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      return { location: 'prompt', backgroundLocation: 'prompt' };
    }
  }
}

// Create and export an instance of the plugin
export const LocationPermissionsWebInstance = new LocationPermissionsWeb();
