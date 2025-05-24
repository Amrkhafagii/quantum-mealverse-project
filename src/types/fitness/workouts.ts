
export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  difficulty: string;
  frequency: number;
  duration_weeks: number;
  goal: string;
  workout_days: WorkoutDay[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks?: number;
  frequency_per_week?: number;
  goal?: string;
  workout_days: WorkoutDay[];
  is_public: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  day_name: string;
  exercises: Exercise[];
  day_number?: number;
  target_muscle_groups?: string[];
  completed?: boolean;
  order?: number;
}

export interface Exercise {
  id: string;
  name: string;
  exercise_id?: string;
  exercise_name?: string;
  target_muscle?: string;
  sets: number;
  reps: string | number;
  weight?: number;
  duration?: number | string;
  rest_time?: number;
  rest?: number;
  rest_seconds?: number;
  completed?: boolean;
  instructions?: string;
  notes?: string;
}
