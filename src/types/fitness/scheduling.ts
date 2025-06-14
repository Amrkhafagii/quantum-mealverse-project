
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
  type: 'workout';
  workoutPlanId?: string;
  scheduleId?: string;
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
  duration?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
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
