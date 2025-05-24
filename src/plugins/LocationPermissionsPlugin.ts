
import { registerPlugin } from '@capacitor/core';

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
 * Create the LocationPermissions plugin with simple fallback
 */
const createLocationPermissionsPlugin = (): LocationPermissionsPlugin => {
  console.log("Initializing LocationPermissions plugin");
  
  // Simple fallback implementation that always throws UNIMPLEMENTED
  // This will force the useLocationPermission hook to use standard Geolocation API
  const fallbackPlugin: LocationPermissionsPlugin = {
    async requestPermissions() {
      console.log("LocationPermissions plugin not available, using fallback");
      throw new Error('UNIMPLEMENTED: LocationPermissions plugin not available');
    },
    
    async requestLocationPermission(options: { includeBackground?: boolean }) {
      console.log("LocationPermissions plugin not available, using fallback");
      throw new Error('UNIMPLEMENTED: LocationPermissions plugin not available');
    },
    
    async checkPermissionStatus() {
      console.log("LocationPermissions plugin not available, using fallback");
      throw new Error('UNIMPLEMENTED: LocationPermissions plugin not available');
    }
  };
  
  try {
    // Try to register the plugin, but always return fallback for now
    const rawPlugin = registerPlugin<LocationPermissionsPlugin>('LocationPermissions', {
      web: () => Promise.resolve(fallbackPlugin),
    });
    
    // Return fallback to force standard Geolocation API usage
    return fallbackPlugin;
  } catch (error) {
    console.error('Error initializing LocationPermissions plugin:', error);
    return fallbackPlugin;
  }
};

// Export singleton instance
const LocationPermissions = createLocationPermissionsPlugin();

export default LocationPermissions;
