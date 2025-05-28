
export interface DeliveryAvailabilitySchedule {
  id: string;
  delivery_user_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // TIME format (HH:MM:SS)
  end_time: string; // TIME format (HH:MM:SS)
  is_active: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryBreakSetting {
  id: string;
  delivery_user_id: string;
  break_type: 'short_break' | 'lunch_break' | 'custom_break';
  duration_minutes: number;
  scheduled_time?: string; // TIME format (HH:MM:SS)
  is_flexible: boolean;
  max_break_count_per_day: number;
  minimum_interval_between_breaks_minutes: number;
  auto_break_reminder: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryBreakLog {
  id: string;
  delivery_user_id: string;
  break_setting_id?: string;
  start_time: string;
  end_time?: string;
  actual_duration_minutes?: number;
  break_type: string;
  status: 'active' | 'completed' | 'interrupted';
  location_latitude?: number;
  location_longitude?: number;
  notes?: string;
  created_at: string;
}

export interface DeliveryEmergencyContact {
  id: string;
  delivery_user_id: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  relationship: string;
  is_primary: boolean;
  contact_priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAutoStatusSettings {
  id: string;
  delivery_user_id: string;
  
  // Location-based status changes
  enable_location_based_status: boolean;
  work_zone_latitude?: number;
  work_zone_longitude?: number;
  work_zone_radius_meters: number;
  auto_active_in_work_zone: boolean;
  auto_inactive_outside_work_zone: boolean;
  
  // Time-based status changes
  enable_time_based_status: boolean;
  auto_active_on_schedule: boolean;
  auto_inactive_off_schedule: boolean;
  pre_shift_buffer_minutes: number;
  post_shift_buffer_minutes: number;
  
  // Break-based status changes
  auto_break_status_during_breaks: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface BreakStatus {
  is_on_break: boolean;
  break_type?: string;
  break_start_time?: string;
  estimated_end_time?: string;
}
