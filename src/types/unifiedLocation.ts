
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
}

export type LocationSource = 'gps' | 'network' | 'wifi' | 'cell_tower' | 'ip' | 'manual' | 'cached' | 'fusion';

export type LocationType = 'delivery_driver' | 'restaurant' | 'customer' | 'order' | 'system';

export type LocationFreshness = 'fresh' | 'stale' | 'expired';

export interface DeviceInfo {
  platform: Platform;
  model?: string;
  osVersion?: string;
  appVersion?: string;
  deviceId?: string;
}

export interface NetworkInfo {
  type: string;
  effectiveType?: string;
  downlink?: number;
}

export type Platform = 'ios' | 'android' | 'web' | 'unknown';

export interface ConfidenceScore {
  accuracy: number;
  recency: number;
  source: number;
  overall: number;
}

export interface LocationHistoryEntry extends UnifiedLocation {
  id: string;
  timestamp: string;
  address?: string;
  place_name?: string;
  metadata?: any;
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
