
export type LocationSource = 'gps' | 'network' | 'passive' | 'manual' | 'cached' | 'wifi' | 'cell' | 'unknown' | 'fusion';

export type TrackingMode = 'off' | 'passive' | 'battery-optimized' | 'medium' | 'high-accuracy';

export type LocationFreshness = 'fresh' | 'stale' | 'invalid';

export interface DeliveryLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  source?: LocationSource;
  isMoving?: boolean;
}

export interface LocationHistoryEntry {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  source?: LocationSource;
  user_id?: string;
  created_at?: string;
}

export interface LocationPermissionHookResponse {
  permissionStatus: 'granted' | 'denied' | 'prompt';
  requestPermission: () => Promise<boolean>;
  isRequesting: boolean;
}
