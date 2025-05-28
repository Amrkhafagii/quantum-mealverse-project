
export interface BatteryPerformanceSettings {
  id: string;
  delivery_user_id: string;
  
  // Adaptive tracking configuration
  tracking_mode: 'high' | 'medium' | 'low' | 'adaptive';
  high_accuracy_interval: number;
  medium_accuracy_interval: number;
  low_accuracy_interval: number;
  distance_filter_high: number;
  distance_filter_medium: number;
  distance_filter_low: number;
  
  // Battery threshold settings
  battery_high_threshold: number;
  battery_medium_threshold: number;
  battery_low_threshold: number;
  battery_critical_threshold: number;
  enable_low_power_mode: boolean;
  auto_reduce_accuracy_on_low_battery: boolean;
  
  // Network quality adaptation
  network_quality_optimization: boolean;
  wifi_preferred_interval: number;
  cellular_interval: number;
  poor_network_interval: number;
  offline_mode_interval: number;
  enable_data_compression: boolean;
  
  // Motion detection sensitivity
  motion_detection_enabled: boolean;
  motion_sensitivity: 'low' | 'medium' | 'high';
  stationary_timeout_minutes: number;
  movement_threshold_meters: number;
  speed_threshold_kmh: number;
  auto_pause_tracking_when_stationary: boolean;
  
  // Performance optimization
  background_processing_enabled: boolean;
  location_batching_enabled: boolean;
  batch_size: number;
  batch_timeout_seconds: number;
  cpu_optimization_level: 'performance' | 'balanced' | 'power_save';
  
  created_at: string;
  updated_at: string;
}
