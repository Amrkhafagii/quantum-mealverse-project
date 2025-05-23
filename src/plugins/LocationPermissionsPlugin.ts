
import { registerPlugin } from '@capacitor/core';
import { Platform } from '@/utils/platform';
import { createSafeBridge, BridgeErrorType, createBridgeError } from '@/utils/errorHandling';

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
    
    // Create a safe version with detailed error handling
    const safePlugin = createSafeBridge('LocationPermissions', rawPlugin, {
      retryCount: 1,
      retryDelay: 1000,
      timeout: 15000
    });
    
    // Ensure requestLocationPermission calls requestPermissions for consistency
    const originalRequestPermissions = safePlugin.requestPermissions;
    safePlugin.requestLocationPermission = async (options) => {
      console.log("Forwarding requestLocationPermission to requestPermissions with options:", options);
      return originalRequestPermissions(options);
    };
    
    return safePlugin;
  } catch (error) {
    console.error('Critical error initializing LocationPermissions plugin:', error);
    
    // Return a fallback implementation that provides detailed errors
    return {
      requestPermissions: async () => {
        const bridgeError = createBridgeError(
          BridgeErrorType.INITIALIZATION,
          'LocationPermissions plugin failed to initialize',
          'plugin_init_failed',
          error
        );
        throw bridgeError;
      },
      requestLocationPermission: async () => {
        const bridgeError = createBridgeError(
          BridgeErrorType.INITIALIZATION,
          'LocationPermissions plugin failed to initialize',
          'plugin_init_failed',
          error
        );
        throw bridgeError;
      },
      checkPermissionStatus: async () => {
        const bridgeError = createBridgeError(
          BridgeErrorType.INITIALIZATION,
          'LocationPermissions plugin failed to initialize',
          'plugin_init_failed',
          error
        );
        throw bridgeError;
      }
    };
  }
};

// Export singleton instance
const LocationPermissions = createLocationPermissionsPlugin();

export default LocationPermissions;
