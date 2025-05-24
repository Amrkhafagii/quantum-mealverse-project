
import { registerPlugin } from '@capacitor/core';
import { Platform } from '@/utils/platform';

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

/**
 * Create the LocationPermissions plugin with enhanced error handling
 */
const createLocationPermissionsPlugin = (): LocationPermissionsPlugin => {
  try {
    console.log("Initializing LocationPermissions plugin");
    
    // Register the plugin with a web fallback
    const rawPlugin = registerPlugin<LocationPermissionsPlugin>('LocationPermissions', {
      web: () => import('./web/LocationPermissionsWeb').then(m => m.LocationPermissionsWebInstance),
    });
    
    console.log("LocationPermissions plugin registered successfully");
    return rawPlugin;
  } catch (error) {
    console.error('Critical error initializing LocationPermissions plugin:', error);
    
    // Return a fallback implementation that provides detailed errors
    return {
      requestPermissions: async () => {
        throw new Error(`LocationPermissions plugin failed to initialize: ${error instanceof Error ? error.message : String(error)}`);
      },
      requestLocationPermission: async () => {
        throw new Error(`LocationPermissions plugin failed to initialize: ${error instanceof Error ? error.message : String(error)}`);
      },
      checkPermissionStatus: async () => {
        throw new Error(`LocationPermissions plugin failed to initialize: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
  }
};

// Export singleton instance
const LocationPermissions = createLocationPermissionsPlugin();

export default LocationPermissions;
