
import { registerPlugin } from '@capacitor/core';

export interface LocationPermissionStatus {
  location: PermissionState;
  backgroundLocation: PermissionState;
}

export interface LocationPermissionsPlugin {
  requestLocationPermission(options: { includeBackground?: boolean }): Promise<LocationPermissionStatus>;
  checkPermissionStatus(): Promise<LocationPermissionStatus>;
}

const LocationPermissions = registerPlugin<LocationPermissionsPlugin>('LocationPermissions');

export default LocationPermissions;
