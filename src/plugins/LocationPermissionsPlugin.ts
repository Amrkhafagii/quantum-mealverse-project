
import { registerPlugin } from '@capacitor/core';
import { Platform } from '@/utils/platform';
import { createBridgeError, BridgeErrorType } from '@/utils/errorHandling';

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
    
    // Wrap methods with enhanced error handling
    const safePlugin: LocationPermissionsPlugin = {
      async requestPermissions(options: { includeBackground?: boolean }) {
        try {
          console.log("Calling requestPermissions with options:", options);
          const result = await rawPlugin.requestPermissions(options);
          console.log("requestPermissions result:", result);
          return result;
        } catch (error) {
          console.error("Error in requestPermissions:", error);
          throw new Error(`Failed to request location permissions: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
      
      async requestLocationPermission(options: { includeBackground?: boolean }) {
        console.log("Forwarding requestLocationPermission to requestPermissions with options:", options);
        return this.requestPermissions(options);
      },
      
      async checkPermissionStatus() {
        try {
          console.log("Calling checkPermissionStatus");
          const result = await rawPlugin.checkPermissionStatus();
          console.log("checkPermissionStatus result:", result);
          return result;
        } catch (error) {
          console.error("Error in checkPermissionStatus:", error);
          throw new Error(`Failed to check location permissions: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    };
    
    return safePlugin;
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
