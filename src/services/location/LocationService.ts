
import { UnifiedLocation, LocationPermissionStatus, LocationFreshness } from '@/types/unifiedLocation';
import { DeliveryLocation } from '@/types/location';

export interface LocationTrackingOptions {
  enableHighAccuracy?: boolean;
  interval?: number;
  distanceFilter?: number;
  useSignificantChanges?: boolean;
  persistLocations?: boolean;
}

export interface ILocationService {
  getCurrentLocation(): Promise<DeliveryLocation | null>;
  getLastKnownLocation(): DeliveryLocation | null;
  getPermissionStatus(): Promise<LocationPermissionStatus>;
  startTracking(options?: LocationTrackingOptions): Promise<boolean>;
  stopTracking(): Promise<void>;
  requestPermission(): Promise<LocationPermissionStatus>;
  addLocationListener(callback: (location: DeliveryLocation) => void): string;
  removeLocationListener(id: string): void;
  getFreshness(): LocationFreshness;
  updateTrackingOptions(options: LocationTrackingOptions): Promise<boolean>;
  clearLocationCache(): void;
}

export class LocationServiceFactory {
  private static instance: ILocationService | null = null;

  public static async getLocationService(): Promise<ILocationService> {
    if (!LocationServiceFactory.instance) {
      // Implementation placeholder - would instantiate real service
      LocationServiceFactory.instance = {
        getCurrentLocation: async (): Promise<DeliveryLocation | null> => {
          console.log("Getting current location");
          return null;
        },
        getLastKnownLocation: (): DeliveryLocation | null => {
          console.log("Getting last known location");
          return null;
        },
        getPermissionStatus: async (): Promise<LocationPermissionStatus> => {
          console.log("Getting permission status");
          return 'prompt';
        },
        startTracking: async (): Promise<boolean> => {
          console.log("Starting location tracking");
          return true;
        },
        stopTracking: async (): Promise<void> => {
          console.log("Stopping location tracking");
        },
        requestPermission: async (): Promise<LocationPermissionStatus> => {
          console.log("Requesting location permission");
          return 'prompt';
        },
        addLocationListener: (): string => {
          console.log("Adding location listener");
          return "listener-id";
        },
        removeLocationListener: (): void => {
          console.log("Removing location listener");
        },
        getFreshness: (): LocationFreshness => {
          return 'fresh';
        },
        updateTrackingOptions: async (): Promise<boolean> => {
          console.log("Updating tracking options");
          return true;
        },
        clearLocationCache: (): void => {
          console.log("Clearing location cache");
        }
      };
    }
    
    return LocationServiceFactory.instance;
  }
}

export function convertToUnifiedLocation(location: any): UnifiedLocation {
  // Basic validation
  if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    throw new Error('Invalid location data');
  }
  
  // Create unified location object
  const unifiedLocation: UnifiedLocation = {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy || undefined,
    altitude: location.altitude || null,
    altitudeAccuracy: location.altitudeAccuracy || null,
    heading: location.heading || null,
    speed: location.speed || null,
    timestamp: location.timestamp || Date.now()
  };
  
  // Add optional fields if they exist
  if (location.source) {
    unifiedLocation.source = location.source;
  }
  
  return unifiedLocation;
}
