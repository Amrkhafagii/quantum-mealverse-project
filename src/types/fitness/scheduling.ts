
export interface WorkoutSchedule {
  id: string;
  workout_plan_id: string;
  days_of_week: number[];
  start_date: string;
  end_date?: string;
  preferred_time?: string;
  reminder_enabled?: boolean;
  is_active: boolean;
  name?: string;
  timezone?: string;
  reminder_minutes_before?: number;
  // Legacy/compat fields for cross-version
  user_id?: string;
  workout_schedules_user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// For the calendar UI and hooks
export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  status?: string;
  time?: string;
  type?: string;
  workoutPlanId?: string;
  scheduleId?: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_plan_id: string;
  workout_schedule_id: string;
  scheduled_date: string;
  scheduled_time?: string;
  started_at?: string;
  completed_at?: string;
  duration?: number;
  duration_minutes?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWorkoutScheduleData {
  workout_plan_id: string;
  days_of_week: number[];
  start_date: string;
  end_date?: string;
  preferred_time?: string;
  reminder_enabled?: boolean;
  is_active: boolean;
  name?: string;
  timezone?: string;
  reminder_minutes_before?: number;
}
