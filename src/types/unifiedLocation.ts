
export type LocationSource = 'gps' | 'wifi' | 'cell_tower' | 'ip_address' | 'fused' | 'unknown';
export type NetworkType = 'wifi' | 'cellular_5g' | 'cellular_4g' | 'cellular_3g' | 'cellular_2g' | 'ethernet' | 'unknown' | 'none';
export type Platform = 'ios' | 'android' | 'web';
export type LocationMode = 'foreground' | 'background' | 'passive';
export type LocationPermission = 'granted' | 'denied' | 'restricted' | 'unknown';

export interface DeviceInfo {
  platform: Platform;
  model?: string;
  osVersion?: string;
}

export interface NetworkInfo {
  type: NetworkType;
  connected: boolean;
  connectionType?: string;
  estimatedBandwidth?: number;
  metered?: boolean;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  mode?: LocationMode;
}

export interface UnifiedLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  source?: LocationSource;
  sourceConfidence?: number;
  deviceInfo?: DeviceInfo;
  networkInfo?: NetworkInfo;
  isMoving?: boolean;
  metadata?: {
    applicationState?: 'active' | 'background' | 'inactive';
    batteryLevel?: number;
    batteryIsCharging?: boolean;
    activityType?: 'still' | 'walking' | 'running' | 'automotive';
    verticalAccuracy?: number;
    bearingAccuracy?: number;
    speedAccuracy?: number;
    isMock?: boolean;
    significantChange?: boolean;
    syncStatus?: 'local' | 'syncing' | 'synced' | 'failed';
  };
  address?: {
    formattedAddress?: string;
    locality?: string;
    adminArea?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface LocationError {
  code: number;
  message: string;
  type: 'permission' | 'position' | 'timeout' | 'network' | 'unknown';
  fatal: boolean;
}

export interface LocationServiceConfig {
  desiredAccuracy?: 'high' | 'medium' | 'low' | 'passive';
  distanceFilter?: number;
  stationaryRadius?: number;
  activityType?: string;
  debounce?: number;
  stopOnTerminate?: boolean;
  startOnBoot?: boolean;
  enableBackgroundLocation?: boolean;
  headlessJS?: boolean;
  showsBackgroundLocationIndicator?: boolean;
  pausesLocationUpdatesAutomatically?: boolean;
}
