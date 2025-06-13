
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'skipped' | 'in_progress';
  type: 'workout' | 'rest' | 'active_recovery';
  description?: string;
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
