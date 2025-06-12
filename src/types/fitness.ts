export interface WorkoutPlan {
  id?: string;
  user_id: string; // Changed from number to string (UUID)
  name: string;
  description?: string;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  frequency: number;
  duration_weeks: number;
  workout_days: WorkoutDay[];
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface WorkoutLog {
  id?: string;
  user_id: string; // Changed from number to string (UUID)
  workout_plan_id?: string;
  date: string;
  duration?: number;
  calories_burned?: number;
  notes?: string;
  completed_exercises: CompletedExercise[];
  created_at?: string;
}

export interface ExerciseSet {
  id?: string;
  user_id: string; // Changed from number to string (UUID)
  exercise_name: string;
  weight: number;
  reps: number;
  rest_time?: number;
  notes?: string;
  workout_log_id?: string;
  created_at?: string;
}

export interface WorkoutSchedule {
  id?: string;
  user_id: string; // Changed from number to string (UUID)
  workout_plan_id?: string;
  day_of_week?: number;
  days_of_week: number[];
  time?: string;
  preferred_time?: string;
  reminder?: boolean;
  start_date?: string;
  end_date?: string;
  active?: boolean;
}

export interface WorkoutHistoryItem {
  id: string;
  user_id: string; // Changed from number to string (UUID)
  workout_log_id?: string;
  date: string;
  workout_plan_name: string;
  workout_day_name: string;
  duration: number;
  exercises_completed: number;
  total_exercises: number;
  calories_burned?: number;
  created_at?: string;
}

export interface SavedMealPlan {
  id?: string;
  user_id: string; // Changed from number to string (UUID)
  name: string;
  description?: string;
  meals: any[];
  nutritional_targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags?: string[];
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutDay {
  day_name: string;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  target_muscle: string;
  sets: number;
  reps: number | string;
  weight?: number;
  rest: number;
  notes?: string;
  preparation_time?: number;
}

export interface CompletedExercise {
  exercise_name: string;
  sets_completed: number;
  reps_completed: number[];
  weight_used: number[];
  notes?: string;
}

export interface UserProfile {
  id: string;
  user_id: string; // Changed from number to string (UUID)
  height?: number;
  weight?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  fitness_goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_endurance';
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseProgress {
  id?: string;
  user_id: string; // Changed from number to string (UUID)
  exercise_name: string;
  workout_log_id?: string;
  max_weight?: number;
  max_reps?: number;
  total_volume?: number;
  one_rep_max?: number;
  recorded_date: string;
  created_at?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
}

export interface UserAchievement {
  id: string;
  user_id: string; // Changed from number to string (UUID)
  achievement_id: string;
  unlocked_at: string;
  progress?: number;
}
