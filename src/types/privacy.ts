
export interface LocationDataRetentionPolicy {
  id: string;
  user_id: string;
  retention_period_days: number;
  auto_anonymize_after_days: number;
  auto_delete_after_days: number;
  export_format: 'json' | 'csv' | 'gpx';
  created_at: string;
  updated_at: string;
}

export interface DataAnonymizationSettings {
  id: string;
  user_id: string;
  anonymize_location_data: boolean;
  anonymize_device_info: boolean;
  anonymize_usage_patterns: boolean;
  precision_reduction_level: number; // 1-5, where 5 is least precise
  created_at: string;
  updated_at: string;
}

export interface ThirdPartySharePreferences {
  id: string;
  user_id: string;
  analytics_sharing: boolean;
  marketing_sharing: boolean;
  research_sharing: boolean;
  location_sharing_partners: string[];
  data_processing_consent: boolean;
  consent_date?: string;
  created_at: string;
  updated_at: string;
}

export interface LocationAnonymizationLog {
  id: string;
  user_id: string;
  original_location_count: number;
  anonymized_location_count: number;
  anonymization_method: string;
  precision_level: number;
  processed_at: string;
}

export interface DataExportRequest {
  id: string;
  user_id: string;
  request_type: 'location_history' | 'full_profile' | 'anonymized_data';
  export_format: 'json' | 'csv' | 'gpx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  expires_at?: string;
  created_at: string;
  completed_at?: string;
}

export interface LocationExportData {
  export_id: string;
  user_id: string;
  export_date: string;
  format: string;
  data: LocationHistoryEntry[];
}

export interface LocationHistoryEntry {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  location_type: string;
  is_anonymized: boolean;
}
