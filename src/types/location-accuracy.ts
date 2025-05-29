
export interface DeliveryLocationAccuracySettings {
  id: string;
  delivery_user_id: string;
  
  // Minimum accuracy requirements (in meters)
  minimum_accuracy_threshold: number;
  strict_accuracy_enforcement: boolean;
  reject_low_accuracy_locations: boolean;
  
  // Location validation settings
  enable_location_validation: boolean;
  validate_speed_consistency: boolean;
  max_speed_threshold_mps: number;
  validate_distance_jumps: boolean;
  max_distance_jump_meters: number;
  
  // Backup location providers configuration
  enable_backup_providers: boolean;
  primary_provider: 'gps' | 'network' | 'passive';
  fallback_provider: 'gps' | 'network' | 'passive';
  provider_timeout_seconds: number;
  
  // Location confidence scoring thresholds
  confidence_scoring_enabled: boolean;
  minimum_confidence_score: number;
  accuracy_weight: number;
  recency_weight: number;
  source_weight: number;
  network_weight: number;
  
  created_at: string;
  updated_at: string;
}

export interface DeliveryLocationQualityLog {
  id: string;
  delivery_user_id: string;
  
  // Location data
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp_recorded: string;
  
  // Quality metrics
  confidence_score?: number;
  accuracy_score?: number;
  recency_score?: number;
  source_score?: number;
  network_score?: number;
  
  // Provider and validation info
  location_provider?: string;
  validation_passed: boolean;
  validation_errors?: string[];
  backup_provider_used: boolean;
  
  // Context data
  network_type?: string;
  network_quality?: string;
  battery_level?: number;
  is_moving?: boolean;
  
  created_at: string;
}

export interface LocationValidationResult {
  is_valid: boolean;
  confidence_score: number;
  validation_errors: string[];
  should_use_backup: boolean;
}

export type LocationProvider = 'gps' | 'network' | 'passive';
