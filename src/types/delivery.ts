
// Delivery-related types with updated user ID naming

export interface DeliveryAssignment {
  id: string;
  order_id: string;
  delivery_user_id?: string;
  restaurant_id?: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  pickup_time?: string;
  delivery_time?: string;
  estimated_delivery_time?: string;
  latitude?: number;
  longitude?: number;
  priority_score?: number;
  expires_at?: string;
  auto_assigned?: boolean;
  assignment_attempt?: number;
  max_attempts?: number;
}

export interface DeliveryLocation {
  id: string;
  assignment_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface DeliveryLocationTracking {
  id: string;
  delivery_user_id: string;
  delivery_assignment_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
  altitude?: number;
  accuracy?: number;
  battery_level?: number;
  network_type?: string;
  created_at: string;
}

export interface DeliveryLocationUpdate {
  id: string;
  delivery_user_id?: string;
  assignment_id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  battery_level?: number;
  is_moving?: boolean;
  location_source?: string;
  timestamp: string;
  created_at: string;
}

export interface DeliveryEarnings {
  id: string;
  delivery_user_id: string;
  order_id?: string;
  base_amount: number;
  bonus_amount?: number;
  tip_amount?: number;
  total_amount?: number;
  status: 'pending' | 'processing' | 'paid' | 'cancelled';
  payout_date?: string;
  created_at: string;
  updated_at: string;
}

// Legacy type alias for backward compatibility
export type DeliveryEarning = DeliveryEarnings;

export interface DeliveryAvailability {
  id: string;
  delivery_user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryDriverAvailability {
  id: string;
  delivery_user_id: string;
  is_available?: boolean;
  current_latitude?: number;
  current_longitude?: number;
  availability_radius_km?: number;
  max_concurrent_deliveries?: number;
  current_delivery_count?: number;
  last_location_update?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryMetrics {
  id: string;
  delivery_user_id: string;
  date: string;
  total_deliveries: number;
  completed_deliveries: number;
  cancelled_deliveries: number;
  total_earnings: number;
  total_tips: number;
  total_bonuses: number;
  avg_delivery_time: number;
  completion_rate: number;
  acceptance_rate: number;
  customer_rating: number;
  total_distance_km: number;
  fuel_cost: number;
  net_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface BatteryPerformanceSettings {
  id: string;
  delivery_user_id: string;
  high_accuracy_interval: number;
  medium_accuracy_interval: number;
  low_accuracy_interval: number;
  distance_filter_high: number;
  distance_filter_medium: number;
  distance_filter_low: number;
  battery_high_threshold: number;
  battery_medium_threshold: number;
  battery_low_threshold: number;
  battery_critical_threshold: number;
  enable_low_power_mode: boolean;
  auto_reduce_accuracy_on_low_battery: boolean;
  network_quality_optimization: boolean;
  wifi_preferred_interval: number;
  cellular_interval: number;
  poor_network_interval: number;
  offline_mode_interval: number;
  enable_data_compression: boolean;
  motion_detection_enabled: boolean;
  stationary_timeout_minutes: number;
  movement_threshold_meters: number;
  speed_threshold_kmh: number;
  tracking_mode: string;
  motion_sensitivity: string;
  cpu_optimization_level: string;
  location_batching_enabled: boolean;
  batch_size: number;
  batch_timeout_seconds: number;
  background_processing_enabled: boolean;
  auto_pause_tracking_when_stationary: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryLocationSettings {
  id: string;
  delivery_user_id: string;
  background_location_enabled?: boolean;
  high_accuracy_threshold?: number;
  medium_accuracy_threshold?: number;
  low_accuracy_threshold?: number;
  high_accuracy_interval?: number;
  medium_accuracy_interval?: number;
  low_accuracy_interval?: number;
  battery_optimization_enabled?: boolean;
  movement_detection_sensitivity?: string;
  sharing_precision_level?: string;
  delivery_zone_radius?: number;
  custom_geofence_zones?: any;
  geofence_entry_notifications?: boolean;
  geofence_exit_notifications?: boolean;
  location_sharing_duration?: number;
  auto_stop_sharing_after_delivery?: boolean;
  created_at: string;
  updated_at: string;
}

// Updated DeliveryUser with proper fields
export interface DeliveryUser {
  id: string;
  delivery_users_user_id: string; // Updated to match new naming convention
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  vehicle_type: string;
  license_plate: string;
  driver_license_number: string;
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  total_deliveries: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  background_check_status: 'pending' | 'approved' | 'rejected';
  is_available: boolean;
  is_approved?: boolean;
  last_active: string;
  created_at: string;
  updated_at: string;
}

// Updated DeliveryVehicle with proper fields
export interface DeliveryVehicle {
  id: string;
  delivery_vehicles_user_id: string; // Updated to match new naming convention
  delivery_user_id?: string; // For backward compatibility
  vehicle_type: string;
  type?: string; // For form compatibility
  make: string;
  model: string;
  year: number;
  license_plate: string;
  color: string;
  insurance_policy_number?: string;
  insurance_number?: string;
  insurance_expiry?: string;
  registration_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryDocument {
  id: string;
  delivery_documents_user_id: string; // Updated to match new naming convention
  document_type: 'license' | 'insurance' | 'registration' | 'background_check' | 'profile_photo' | 'drivers_license' | 'vehicle_registration' | 'identity';
  document_url: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  expiry_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryPaymentDetails {
  id: string;
  delivery_payment_details_user_id: string; // Updated to match new naming convention
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_holder_name: string;
  account_type: 'checking' | 'savings';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}
