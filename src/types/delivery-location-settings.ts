
export interface DeliveryLocationSettings {
  id: string;
  delivery_user_id: string;
  
  // Location accuracy thresholds (in meters)
  high_accuracy_threshold: number;
  medium_accuracy_threshold: number;
  low_accuracy_threshold: number;
  
  // Custom tracking intervals (in milliseconds)
  high_accuracy_interval: number;
  medium_accuracy_interval: number;
  low_accuracy_interval: number;
  
  // Geofencing preferences
  delivery_zone_radius: number;
  geofence_entry_notifications: boolean;
  geofence_exit_notifications: boolean;
  custom_geofence_zones: GeofenceZone[];
  
  // Location sharing duration settings
  location_sharing_duration: number; // minutes
  auto_stop_sharing_after_delivery: boolean;
  sharing_precision_level: 'high' | 'medium' | 'low';
  
  // Additional settings
  battery_optimization_enabled: boolean;
  background_location_enabled: boolean;
  movement_detection_sensitivity: 'high' | 'medium' | 'low';
  
  created_at: string;
  updated_at: string;
}

export interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: 'restaurant' | 'customer' | 'custom';
  enabled: boolean;
}

export type DeliveryLocationSettingsUpdate = Partial<Omit<DeliveryLocationSettings, 'id' | 'delivery_user_id' | 'created_at' | 'updated_at'>>;
