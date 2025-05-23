
import { registerPlugin } from '@capacitor/core';

export interface LocationPermissionStatus {
  location: PermissionState;
  backgroundLocation: PermissionState;
}

export interface LocationPermissionsPlugin {
  requestPermission(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus>;
  requestLocationPermission(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus>;
  checkPermissionStatus(): Promise<LocationPermissionStatus>;
}

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
        return promiseWithGeolocation();
      },
      
      requestLocationPermission: async (options: { includeBackground?: boolean }): Promise<LocationPermissionStatus> => {
        console.warn('LocationPermissions plugin not available, using fallback');
        return promiseWithGeolocation();
      },
      
      checkPermissionStatus: async (): Promise<LocationPermissionStatus> => {
        console.warn('LocationPermissions plugin not available, using fallback');
        // Default to prompt when plugin is unavailable
        return checkPermissionWithGeolocation();
      }
    } as LocationPermissionsPlugin;
  }
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
        backgroundLocation: 'prompt'
      };
    }
  } catch (e) {
    console.warn('Permission API not available, permission status unknown');
  }
  
  return { location: 'prompt', backgroundLocation: 'prompt' };
};

// Helper function to get permission using standard geolocation API
const promiseWithGeolocation = (): Promise<LocationPermissionStatus> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ location: 'prompt', backgroundLocation: 'prompt' });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      () => resolve({ location: 'granted', backgroundLocation: 'prompt' }),
      (error) => {
        if (error.code === 1) { // PERMISSION_DENIED
          resolve({ location: 'denied', backgroundLocation: 'denied' });
        } else {
          resolve({ location: 'prompt', backgroundLocation: 'prompt' });
        }
      },
      { timeout: 10000 }
    );
  });
};

const LocationPermissions = createSafeLocationPermissions();

export default LocationPermissions;
