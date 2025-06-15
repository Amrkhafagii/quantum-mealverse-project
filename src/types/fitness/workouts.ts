
export interface WorkoutPlan {
  id: string;
  user_id: string; // Standard field name
  workout_plans_user_id?: string; // Database field name for compatibility
  name: string;
  description?: string;
  difficulty_level?: string;
  duration_minutes?: number; // Made optional for backward compatibility
  workout_days?: WorkoutDay[]; // Made optional for backward compatibility
  created_at?: string;
  updated_at?: string;
  
  // Backward compatibility fields
  difficulty?: string;
  duration_weeks?: number;
  frequency?: number;
  goal?: string;
  is_active?: boolean;
}

export interface WorkoutDay {
  id?: string; // Made optional to match fitness.d.ts
  workout_plan_id?: string; // Made optional to match fitness.d.ts
  day_name: string;
  day_number?: number; // Made optional
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
  duration?: string | number; // Changed to match fitness.d.ts
  rest_time?: number;
  rest?: number;
  rest_seconds?: number;
  instructions?: string;
}

export interface CompletedExercise {
  exercise_id?: string;
  name: string;
  sets_completed?: WorkoutSet[];
  notes?: string;
  exercise_name?: string;
  weight_used?: number[];
  reps_completed?: number[];
}

export interface ExerciseSet {
  set_number: number;
  weight: number;
  reps: number | string;
  completed: boolean;
  notes?: string;
  rest_time?: number;
}

export interface WorkoutSet {
  set_number: number;
  weight: number;
  reps: number | string;
  completed: boolean;
  notes?: string;
  rest_time?: number; // Added missing property
}

export interface WorkoutSchedule {
  id: string;
  user_id: string; // Standard field name
  workout_schedules_user_id?: string; // Database field name for compatibility
  workout_plan_id: string;
  scheduled_date: string;
  completed: boolean;
  completed_at?: string;
}

export interface WorkoutHistoryItem {
  id: string;
  user_id: string; // Standard field name
  workout_history_user_id?: string; // Database field name for compatibility
  workout_log_id: string;
  date: string;
  workout_plan_name: string;
  workout_day_name: string;
  exercises_completed: number;
  total_exercises: number;
  duration: number;
  calories_burned?: number;
  // Optional fields for compatibility
  workout_plan_id?: string;
  completed_exercises?: CompletedExercise[];
}

export interface WorkoutRecommendation {
  id: string;
  title: string;
  name: string;
  description: string;
  type: string;
  reason?: string;
  confidence_score?: number;
  user_id: string; // Standard field name
  workout_recommendations_user_id?: string; // Database field name for compatibility
  suggested_at?: string;
  dismissed?: boolean;
  applied?: boolean;
  applied_at?: string;
}

export interface UserWorkoutStats {
  total_workouts: number;
  streak_days?: number;
  streak?: number;
  most_active_day?: string;
  recent_workouts?: any[];
  achievements?: number;
  calories_burned?: number;
  calories_burned_total?: number;
  workout_time_total?: number;
  favorite_workout_type?: string;
}

export interface WorkoutLog {
  id?: string;
  user_id: string; // Standard field name
  workout_logs_user_id?: string; // Database field name for compatibility
  workout_plan_id: string;
  date: string;
  duration: number;
  calories_burned?: number | null;
  notes?: string | null;
  completed_exercises?: CompletedExercise[]; // Made optional for backward compatibility
  // Backward compatibility fields
  duration_minutes?: number;
  exercises_completed?: any[];
  total_sets?: number;
  total_reps?: number;
  total_volume?: number;
  average_heart_rate?: number;
  created_at?: string;
}
