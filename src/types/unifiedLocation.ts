
/**
 * Unified location types that standardize location data across different components
 */

export type LocationFreshness = 'invalid' | 'fresh' | 'stale' | 'moderate' | 'expired';

export type LocationSource = 'gps' | 'network' | 'passive' | 'manual' | 'cached' | 'wifi' | 'unknown';

export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt';

export type NetworkType = 'wifi' | 'cellular' | '4g' | '5g' | '3g' | '2g' | 'unknown' | 'none';

export interface NetworkInfo {
  type: NetworkType;
  connected: boolean;
  strength?: number;
}

export interface DeviceInfo {
  platform: string;
  model?: string;
  manufacturer?: string;
  version?: string;
  uuid?: string;
}

export interface Platform {
  os: string;
  version: string;
  isNative: boolean;
}

export interface UnifiedLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
  source?: LocationSource;
  id?: string;
  networkInfo?: NetworkInfo;
  device_info?: DeviceInfo;
  is_anonymized?: boolean;
  user_id?: string;
  location_type?: string;
  isMoving?: boolean;
  battery_level?: number;
}

export interface ConfidenceScore {
  overall: number;
  accuracy: number;
  recency: number;
  source: number;
  network: number;
}

export interface LocationHistoryEntry extends UnifiedLocation {
  id: string;
  user_id?: string;
  created_at?: string;
}

export interface LocationQueryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  source?: LocationSource[];
  minAccuracy?: number;
  userId?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface LocationPrivacySettings {
  trackingEnabled: boolean;
  anonymizeData: boolean;
  retentionPeriodDays: number;
  shareWithThirdParties: boolean;
}

export interface NetworkMetrics {
  latency: number;
  bandwidth: number;
  connectionType: NetworkType;
  signalStrength?: number;
}

export type LocationType = 'user' | 'restaurant' | 'driver' | 'customer' | 'order' | 'delivery' | 'unknown';
