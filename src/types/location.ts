
export interface LocationWithAccuracy {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface DeliveryLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export type LocationFreshness = 'fresh' | 'moderate' | 'stale' | 'invalid';

export interface LocationServiceState {
  permissionStatus: PermissionState;
  location: DeliveryLocation | null;
  isStale: boolean;
  isTracking: boolean;
  lastUpdated: Date | null;
  error: Error | null;
  freshness: LocationFreshness;
}
