
export interface WorkoutDataExport {
  id: string;
  workout_data_exports_user_id: string; // Updated to match database schema
  export_type: 'progress' | 'full' | 'plans' | 'logs';
  file_format: 'json' | 'csv' | 'pdf';
  date_range_start?: string;
  date_range_end?: string;
  status?: string;
  file_path?: string;
  created_at?: string;
  completed_at?: string;
  error_message?: string;
}
