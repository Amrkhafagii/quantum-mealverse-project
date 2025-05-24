
export type LocationSource = 'gps' | 'network' | 'passive' | 'manual' | 'cached' | 'wifi' | 'cell' | 'unknown' | 'fusion';

export type TrackingMode = 'automatic' | 'battery-optimized' | 'high-accuracy' | 'passive' | 'off';

export interface DeliveryLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  source?: LocationSource;
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
