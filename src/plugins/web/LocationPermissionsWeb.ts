
import { WebPlugin } from '@capacitor/core';
import type { LocationPermissionStatus, LocationPermissionsPlugin } from '../LocationPermissionsPlugin';

export class LocationPermissionsWeb extends WebPlugin implements LocationPermissionsPlugin {
  async requestLocationPermission(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> {
    try {
      // For web, we can only request regular location permission
      const result = await navigator.permissions.query({ name: 'geolocation' });
      
      // Convert result to our format
      const status = this.convertPermissionStatus(result.state);
      
      // If prompt, attempt to request permission by getting position
      if (status.location === 'prompt') {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve({ location: 'granted', backgroundLocation: 'denied' }),
            () => resolve({ location: 'denied', backgroundLocation: 'denied' }),
            { timeout: 10000 }
          );
        });
      }
      
      return status;
    } catch (error) {
      console.error('Web location permission error:', error);
      return { location: 'prompt', backgroundLocation: 'prompt' };
    }
  }

  async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return this.convertPermissionStatus(result.state);
    } catch (error) {
      console.error('Web location permission check error:', error);
      return { location: 'prompt', backgroundLocation: 'prompt' };
    }
  }
  
  private convertPermissionStatus(state: PermissionState): LocationPermissionStatus {
    switch (state) {
      case 'granted':
        return { location: 'granted', backgroundLocation: 'denied' };
      case 'denied':
        return { location: 'denied', backgroundLocation: 'denied' };
      case 'prompt':
      default:
        return { location: 'prompt', backgroundLocation: 'prompt' };
    }
  }
}

export const LocationPermissionsWebInstance = new LocationPermissionsWeb();
