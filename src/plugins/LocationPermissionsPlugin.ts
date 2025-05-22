
import { registerPlugin } from '@capacitor/core';

export interface LocationPermissionStatus {
  location: PermissionState;
  backgroundLocation: PermissionState;
}

export interface LocationPermissionsPlugin {
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
      requestLocationPermission: async (): Promise<LocationPermissionStatus> => {
        console.warn('LocationPermissions plugin not available, using fallback');
        try {
          // Try to use Geolocation API directly as fallback
          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              () => resolve({ location: 'granted', backgroundLocation: 'prompt' }),
              (err) => {
                console.log('Geolocation permission error:', err);
                resolve({ location: 'denied', backgroundLocation: 'denied' });
              },
              { timeout: 10000 }
            );
          });
        } catch (fallbackError) {
          console.error('Fallback location permission check failed:', fallbackError);
          return { location: 'prompt', backgroundLocation: 'prompt' };
        }
      },
      checkPermissionStatus: async (): Promise<LocationPermissionStatus> => {
        console.warn('LocationPermissions plugin not available, using fallback');
        // Default to prompt when plugin is unavailable
        return { location: 'prompt', backgroundLocation: 'prompt' };
      }
    } as LocationPermissionsPlugin;
  }
};

const LocationPermissions = createSafeLocationPermissions();

export default LocationPermissions;
