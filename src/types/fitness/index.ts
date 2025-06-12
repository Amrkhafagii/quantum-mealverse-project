
// Re-export all fitness types from their specific files
export * from './goals';
export * from './achievements';
export * from './challenges';
export * from './nutrition';
export * from './logs';
export * from './analytics';
export * from './recommendations';
export * from './scheduling';

// Only export from workouts file, avoiding duplicates
export type {
  WorkoutPlan,
  WorkoutDay,
  Exercise,
  CompletedExercise,
  ExerciseSet,
  WorkoutSet,
  WorkoutSchedule,
  WorkoutHistoryItem,
  WorkoutRecommendation,
  UserWorkoutStats,
  WorkoutLog
} from './workouts';

// Additional types for UI components
export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'tracking' | 'workout' | 'nutrition' | 'activity';
  requirements: {
    action?: string;
    min_duration?: number;
    macro?: string;
    target?: number;
    steps?: number;
  };
  completed: boolean;
  deadline?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  height?: number;
  weight: number;
  goal_weight?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  fitness_goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_endurance';
  fitness_goals?: string[];
  fitness_level?: string;
  display_name?: string;
  created_at?: string;
  updated_at?: string;
  date_of_birth?: string;
  dietary_preferences?: string[];
  dietary_restrictions?: string[];
}

export interface UserMeasurement {
  id?: string;
  user_id: string;
  date: string;
  weight?: number;
  body_fat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  legs?: number;
  notes?: string;
  created_at?: string;
}

export interface ExerciseProgress {
  id?: string;
  user_id: string;
  exercise_name: string;
  workout_log_id?: string;
  max_weight?: number;
  max_reps?: number;
  total_volume?: number;
  one_rep_max?: number;
  recorded_date: string;
  created_at?: string;
}

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  meals: any[];
  meal_plan?: any;
  nutritional_targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags?: string[];
  is_favorite?: boolean;
  is_active: boolean;
  expires_at?: string;
  date_created?: string;
  created_at?: string;
  updated_at?: string;
}

// Additional types related to hydration tracking
export interface HydrationData {
  targetIntake: number;
  currentIntake: number;
  lastUpdated: string;
  glassSize: number;
}
