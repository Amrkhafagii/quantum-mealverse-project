
export type LocationSource = 'gps' | 'network' | 'passive' | 'manual' | 'cached' | 'wifi' | 'cell' | 'unknown' | 'fusion';

export type TrackingMode = 'off' | 'passive' | 'battery-optimized' | 'medium' | 'high-accuracy';

export type LocationFreshness = 'fresh' | 'stale' | 'invalid';

export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt' | 'restricted';

export type LocationAccuracy = 'low' | 'medium' | 'high' | 'best';

export type LocationBackgroundMode = 'none' | 'location' | 'significant-changes' | 'background-app-refresh';

export interface LocationData {
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
  permissionStatus: LocationPermissionStatus;
  requestPermission: () => Promise<boolean>;
  isRequesting: boolean;
}

export interface LocationConfig {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  trackingMode: TrackingMode;
  backgroundMode: LocationBackgroundMode;
  distanceFilter: number;
  desiredAccuracy: LocationAccuracy;
}

export interface LocationError {
  code: number;
  message: string;
  timestamp: number;
}

export interface LocationState {
  current: LocationData | null;
  isTracking: boolean;
  permission: LocationPermissionStatus;
  error: LocationError | null;
  config: LocationConfig;
  history: LocationHistoryEntry[];
}

export interface LocationWatchOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export type LocationWatchCallback = (location: LocationData | null, error?: LocationError) => void;
