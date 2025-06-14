
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
