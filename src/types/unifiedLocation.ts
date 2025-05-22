
// Location types for the unified location tracking system
export interface UnifiedLocation {
  id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
  source: LocationSource;
  isMoving?: boolean;
  device_info?: DeviceInfo;
  is_anonymized?: boolean;
  user_id?: string;
  location_type?: LocationType;
  order_id?: string;
  delivery_assignment_id?: string;
  restaurant_id?: string;
  geom?: any; // PostGIS geometry type
  network_type?: string;
  battery_level?: number;
  retention_expires_at?: string;
  networkInfo?: NetworkInfo; // Add networkInfo property
}

export type LocationSource = 'gps' | 'network' | 'wifi' | 'cell_tower' | 'ip' | 'manual' | 'cached' | 'fusion' | 'unknown';

export type LocationType = 'delivery_driver' | 'restaurant' | 'customer' | 'order' | 'system';

export type LocationFreshness = 'fresh' | 'stale' | 'expired' | 'moderate' | 'invalid';

export interface DeviceInfo {
  platform: Platform;
  model?: string;
  osVersion?: string;
  appVersion?: string;
  deviceId?: string;
}

export interface NetworkInfo {
  type: NetworkType;
  effectiveType?: string;
  downlink?: number;
  connected?: boolean;
  connectionType?: string;
  estimatedBandwidth?: number;
  metered?: boolean;
}

export type NetworkType = 'wifi' | 'ethernet' | 'cellular_5g' | 'cellular_4g' | 'cellular_3g' | 'cellular_2g' | 'none' | 'unknown';

export type Platform = 'ios' | 'android' | 'web' | 'unknown';

export interface ConfidenceScore {
  overall: number; // 0-100
  factors: {
    source: number;
    accuracy: number;
    recency: number;
    network: number;
    movement: number;
  };
  rating: 'high' | 'medium' | 'low' | 'unknown';
}

export interface NetworkMetrics {
  latency: number | null;
  bandwidth?: number | null;
  jitter?: number | null;
  packetLoss?: number | null;
  effectiveType?: string;
}

export interface LocationHistoryEntry extends UnifiedLocation {
  id: string;
  timestamp: string;
  address?: string;
  place_name?: string;
  metadata?: any;
  formattedAddress?: string; // Add this missing property
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

// Updated LocationPrivacySettings interface with all required properties
export interface LocationPrivacySettings {
  retentionDays: number;
  automaticallyAnonymize: boolean;
  collectDeviceInfo: boolean;
  allowPreciseLocation: boolean;
  allowBackgroundTracking: boolean;
  precisionLevel: 'high' | 'medium' | 'low';
  shareWith: string[];
  retentionPeriod: 'short' | 'medium' | 'long';
  allowThirdPartySharing: boolean;
}
