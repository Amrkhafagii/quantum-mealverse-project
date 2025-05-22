
/**
 * Type definitions for the unified location system
 */

export type LocationType = 'user' | 'delivery' | 'order' | 'restaurant';

export interface UnifiedLocation {
  id: string;
  location_type: LocationType;
  user_id?: string;
  order_id?: string;
  delivery_assignment_id?: string;
  restaurant_id?: string;
  
  // Geolocation data
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  altitude_accuracy?: number;
  heading?: number;
  speed?: number;
  
  // Metadata
  timestamp: string;
  device_info?: DeviceInfo;
  source: LocationSource;
  is_moving?: boolean;
  battery_level?: number;
  network_type?: NetworkType;
  
  // Privacy & compliance
  retention_expires_at?: string;
  is_anonymized?: boolean;
  user_consent?: boolean;
  
  // For PostGIS (will be populated server-side)
  geom?: any;
}

export interface DeviceInfo {
  platform: 'web' | 'ios' | 'android';
  model?: string;
  os_version?: string;
  app_version?: string; // Updated to match the correct property name
}

export type LocationSource = 
  | 'gps' 
  | 'network' 
  | 'wifi' 
  | 'cell_tower' 
  | 'ip' 
  | 'manual' 
  | 'cached';

export type NetworkType =
  | 'wifi'
  | 'cellular_2g'
  | 'cellular_3g'
  | 'cellular_4g'
  | 'cellular_5g'
  | 'unknown'
  | 'none';

export interface LocationQueryParams {
  userId?: string;
  orderId?: string;
  deliveryAssignmentId?: string;
  restaurantId?: string;
  locationType?: LocationType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  includeExpired?: boolean;
}

export interface LocationPrivacySettings {
  retentionDays: number;
  automaticallyAnonymize: boolean;
  collectDeviceInfo: boolean;
  allowPreciseLocation: boolean;
}

export interface LocationHistoryEntry extends UnifiedLocation {
  address?: string;
  place_name?: string;
  activity?: string;
}
