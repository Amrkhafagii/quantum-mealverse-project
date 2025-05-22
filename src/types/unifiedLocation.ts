
import { NetworkQuality } from '@/hooks/useNetworkQuality';

export type LocationMode = 'high' | 'balanced' | 'low' | 'passive';
export type NetworkType = 'wifi' | 'cellular_4g' | 'cellular_5g' | 'cellular_3g' | 'cellular_2g' | 'ethernet' | 'unknown' | 'none';
export type LocationSource = 'gps' | 'wifi' | 'cell' | 'manual' | 'ip' | 'cached' | 'fusion' | 'unknown';
export type LocationType = 'current' | 'destination' | 'pickup' | 'dropoff' | 'waypoint' | 'history' | 'user';
export type LocationFreshness = 'fresh' | 'moderate' | 'stale' | 'invalid' | 'expired' | 'recent';

export interface DeviceInfo {
  platform: string;
  model?: string;
  manufacturer?: string;
  osVersion?: string;
  appVersion?: string;
  batteryLevel?: number;
}

export interface Platform {
  name: string;
  version?: string;
  isWeb?: boolean;
  isNative?: boolean;
}

export interface NetworkInfo {
  type: NetworkType;
  connectionType?: string;
  connected: boolean;
  estimatedBandwidth?: number;
  metered?: boolean;
}

export interface NetworkMetrics {
  latency: number | null;
  bandwidth?: number | null;
  jitter?: number | null;
  packetLoss?: number | null;
  effectiveType?: string;
}

export interface NetworkQualityData {
  quality: NetworkQuality;
  isLowQuality: boolean;
  metrics: NetworkMetrics;
  hasTransitioned: boolean;
  isFlaky: boolean;
}

export interface UnifiedLocation {
  id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  speed?: number;
  altitude?: number;
  heading?: number;
  isMoving?: boolean;
  source: LocationSource;
  deviceInfo?: DeviceInfo;
  networkInfo?: NetworkInfo;
  user_id?: string;
  order_id?: string;
  delivery_assignment_id?: string;
  restaurant_id?: string;
  location_type?: LocationType;
  is_anonymized?: boolean;
  device_info?: DeviceInfo;
  retention_expires_at?: string;
  place_name?: string;
  address?: {
    formattedAddress?: string;
    locality?: string;  
    adminArea?: string;
    country?: string;
    postalCode?: string;
  };
  metadata?: {
    activityType?: string;
    [key: string]: any;
  };
}

export interface LocationHistoryEntry extends UnifiedLocation {
  id: string;
  userId?: string;
  tripId?: string;
  batteryLevel?: number;
  networkQuality?: NetworkQuality;
  place_name?: string;
  address?: {
    formattedAddress?: string;
    locality?: string;
    adminArea?: string;
    country?: string;
    postalCode?: string;
  };
  metadata?: {
    activityType?: string;
    [key: string]: any;
  };
}

export interface LocationQueryParams {
  userId?: string;
  tripId?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
  minAccuracy?: number;
  source?: LocationSource[];
  type?: LocationType;
  startDate?: string;
  endDate?: string;
  includeExpired?: boolean;
  orderId?: string;
  deliveryAssignmentId?: string;
  restaurantId?: string;
  locationType?: LocationType;
}

export interface LocationPrivacySettings {
  allowBackgroundTracking: boolean;
  precisionLevel: 'high' | 'medium' | 'low' | 'approximate';
  shareWith: 'none' | 'app' | 'selected' | 'all';
  retentionPeriod: number; // days
  allowThirdPartySharing: boolean;
  retentionDays?: number;
  automaticallyAnonymize?: boolean;
  collectDeviceInfo?: boolean;
  allowPreciseLocation?: boolean;
}
