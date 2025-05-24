
export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  name: string;
  days_of_week: number[]; // 0=Sunday, 1=Monday, etc.
  start_date: string;
  end_date?: string;
  preferred_time?: string;
  timezone: string;
  is_active: boolean;
  reminder_enabled: boolean;
  reminder_minutes_before: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_plan_id: string;
  workout_schedule_id?: string;
  scheduled_date: string;
  scheduled_time?: string;
  started_at?: string;
  completed_at?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
  duration_minutes?: number;
  calories_burned?: number;
  notes?: string;
  workout_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutReminder {
  id: string;
  user_id: string;
  workout_session_id: string;
  reminder_time: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed';
  created_at?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'workout' | 'rest';
  status: 'scheduled' | 'completed' | 'skipped';
  workout_plan_name?: string;
  duration?: number;
}
