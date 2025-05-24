
import { WebPlugin } from '@capacitor/core';
import { LocationPermissionsPlugin, LocationPermissionStatus, PermissionState } from '../LocationPermissionsPlugin';

export class LocationPermissionsWeb extends WebPlugin implements LocationPermissionsPlugin {
  async requestPermissions(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> {
    // Web doesn't support background location, so ignore that option
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      
      let permissionState: PermissionState;
      switch (result.state) {
        case 'granted':
          permissionState = 'granted';
          break;
        case 'denied':
          permissionState = 'denied';
          break;
        default:
          permissionState = 'prompt';
      }
      
      return {
        location: permissionState,
        backgroundLocation: 'denied' // Web doesn't support background location
      };
    } catch (error) {
      console.error('Error checking web location permissions:', error);
      return {
        location: 'prompt',
        backgroundLocation: 'denied'
      };
    }
  }

  async requestLocationPermission(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> {
    return this.requestPermissions(options);
  }

  async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      
      let permissionState: PermissionState;
      switch (result.state) {
        case 'granted':
          permissionState = 'granted';
          break;
        case 'denied':
          permissionState = 'denied';
          break;
        default:
          permissionState = 'prompt';
      }
      
      return {
        location: permissionState,
        backgroundLocation: 'denied' // Web doesn't support background location
      };
    } catch (error) {
      console.error('Error checking web location permissions:', error);
      return {
        location: 'prompt',
        backgroundLocation: 'denied'
      };
    }
  }
}

export const LocationPermissionsWebInstance = new LocationPermissionsWeb();
