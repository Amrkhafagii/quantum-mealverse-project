
export type ConflictStrategy = 'server_wins' | 'client_wins' | 'timestamp_wins' | 'merge' | 'manual';
export type SyncType = 'manual' | 'auto' | 'scheduled' | 'background';
export type OperationType = 'upload' | 'download' | 'bidirectional';
export type ConflictType = 'location' | 'settings' | 'assignment' | 'other';

export interface DeliveryDataSyncSettings {
  id: string;
  delivery_user_id: string;
  
  // Offline location storage limits
  max_offline_locations: number;
  location_storage_duration_days: number;
  auto_cleanup_enabled: boolean;
  storage_limit_mb: number;
  
  // Sync frequency preferences
  auto_sync_enabled: boolean;
  sync_frequency_minutes: number;
  sync_on_network_change: boolean;
  sync_on_app_foreground: boolean;
  wifi_only_sync: boolean;
  battery_optimized_sync: boolean;
  
  // Conflict resolution preferences
  location_conflict_strategy: ConflictStrategy;
  settings_conflict_strategy: ConflictStrategy;
  auto_resolve_conflicts: boolean;
  prompt_for_manual_resolution: boolean;
  
  // Advanced sync settings
  batch_sync_enabled: boolean;
  max_batch_size: number;
  sync_compression_enabled: boolean;
  priority_sync_enabled: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface DeliverySyncLog {
  id: string;
  delivery_user_id: string;
  
  // Sync operation details
  sync_type: SyncType;
  operation_type: OperationType;
  sync_trigger?: string;
  
  // Sync metrics
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  success: boolean;
  
  // Data details
  locations_synced?: number;
  conflicts_detected?: number;
  conflicts_resolved?: number;
  errors_encountered?: number;
  data_size_kb?: number;
  
  // Error details
  error_message?: string;
  error_details?: any;
  
  // Network context
  network_type?: string;
  connection_quality?: string;
  battery_level?: number;
  
  created_at: string;
}

export interface DeliverySyncConflict {
  id: string;
  delivery_user_id: string;
  sync_log_id?: string;
  
  // Conflict details
  conflict_type: ConflictType;
  resource_id?: string;
  resource_type?: string;
  
  // Conflict data
  local_data: any;
  server_data: any;
  merged_data?: any;
  
  // Resolution details
  resolution_strategy: ConflictStrategy;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  
  // Metadata
  conflict_score?: number;
  auto_resolvable: boolean;
  requires_user_input: boolean;
  
  created_at: string;
}

export interface SyncStats {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  total_conflicts: number;
  resolved_conflicts: number;
  unresolved_conflicts: number;
  average_sync_duration: number;
  last_sync_time?: string;
  storage_used_mb: number;
  storage_limit_mb: number;
}
