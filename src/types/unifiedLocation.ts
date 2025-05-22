
export type LocationSource = 'gps' | 'wifi' | 'cell_tower' | 'ip_address' | 'fused' | 'unknown' | 'manual' | 'network' | 'cached';
export type NetworkType = 'wifi' | 'cellular_5g' | 'cellular_4g' | 'cellular_3g' | 'cellular_2g' | 'ethernet' | 'unknown' | 'none';
export type Platform = 'ios' | 'android' | 'web';
export type LocationMode = 'foreground' | 'background' | 'passive';
export type LocationPermission = 'granted' | 'denied' | 'restricted' | 'unknown';
export type LocationType = 'user' | 'order' | 'restaurant' | 'delivery';

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

export interface LocationPrivacySettings {
  retentionDays: number;
  automaticallyAnonymize: boolean;
  collectDeviceInfo: boolean;
  allowPreciseLocation: boolean;
}

export interface LocationQueryParams {
  userId?: string;
  orderId?: string;
  deliveryAssignmentId?: string;
  restaurantId?: string;
  locationType?: LocationType;
  startDate?: string;
  endDate?: string;
  includeExpired?: boolean;
  limit?: number;
}

export interface LocationHistoryEntry extends UnifiedLocation {
  entryType: 'location' | 'gap' | 'event';
  durationSeconds?: number;
  eventType?: string;
  eventDescription?: string;
  place_name?: string;
  activity?: string;
}

export interface UnifiedLocation {
  id?: string;
  latitude: number;
  longitude: number;
  timestamp: number | string;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  source?: LocationSource;
  sourceConfidence?: number;
  deviceInfo?: DeviceInfo;
  networkInfo?: NetworkInfo;
  isMoving?: boolean;
  network_type?: NetworkType;
  location_type?: LocationType;
  user_id?: string;
  order_id?: string;
  delivery_assignment_id?: string;
  restaurant_id?: string;
  is_anonymized?: boolean;
  device_info?: DeviceInfo;
  retention_expires_at?: string;
  user_consent?: boolean;
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
    replace?: (value: string) => string;
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

export interface NetworkMetrics {
  latency: number;
  bandwidth: number;
  packetLoss: number;
  jitter: number;
  reliability: number;
}

export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor' | 'unknown';
