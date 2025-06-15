
export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
  duration_weeks: number;
  frequency: number;
  workout_days: WorkoutDay[];
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
  created_by?: string;
  // Made duration_minutes optional for backward compatibility
  duration_minutes?: number;
}

export interface WorkoutDay {
  day_name: string;
  exercises: Exercise[];
  estimated_duration?: number;
}

export interface Exercise {
  id?: string;
  exercise_id?: string;
  name: string;
  exercise_name?: string;
  target_muscle: string;
  sets: number;
  reps: number | string;
  weight?: number;
  duration?: string | number;
  rest_time?: number;
  rest?: number;
  rest_seconds?: number;
  instructions?: string;
  notes?: string;
}
