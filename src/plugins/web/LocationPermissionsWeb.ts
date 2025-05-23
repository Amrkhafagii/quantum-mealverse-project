
import { WebPlugin } from '@capacitor/core';
import type { LocationPermissionsPlugin, LocationPermissionStatus } from '../LocationPermissionsPlugin';

export class LocationPermissionsWeb extends WebPlugin implements LocationPermissionsPlugin {
  async requestPermission(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> {
    return this.requestLocationPermission(options);
  }
  
  async requestLocationPermission(_options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> {
    console.log('Web implementation of requestLocationPermission');
    try {
      // For web, try to request permission using the Geolocation API
      if (navigator && navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              resolve({ location: 'granted', backgroundLocation: 'prompt' });
            },
            (error) => {
              console.log('Geolocation permission error:', error);
              if (error.code === error.PERMISSION_DENIED) {
                resolve({ location: 'denied', backgroundLocation: 'denied' });
              } else {
                resolve({ location: 'prompt', backgroundLocation: 'prompt' });
              }
            },
            { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
          );
        });
      }
      
      return { location: 'prompt', backgroundLocation: 'prompt' };
    } catch (error) {
      console.error('Error in web implementation of requestLocationPermission:', error);
      return { location: 'prompt', backgroundLocation: 'prompt' };
    }
  }

  async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    console.log('Web implementation of checkPermissionStatus');
    try {
      if (navigator && navigator.permissions) {
        try {
          const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          if (status.state === 'granted') {
            return { location: 'granted', backgroundLocation: 'prompt' };
          } else if (status.state === 'denied') {
            return { location: 'denied', backgroundLocation: 'denied' };
          }
        } catch (e) {
          console.warn('Permission API error:', e);
        }
      }
      
      return { location: 'prompt', backgroundLocation: 'prompt' };
    } catch (error) {
      console.error('Error in web implementation of checkPermissionStatus:', error);
      return { location: 'prompt', backgroundLocation: 'prompt' };
    }
  }
}

export const LocationPermissionsWebInstance = new LocationPermissionsWeb();
