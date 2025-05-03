
export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  days_of_week: number[];
  day_of_week?: string;
  start_date: string;
  end_date?: string;
  preferred_time?: string;
  time?: string;
  reminder?: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}
