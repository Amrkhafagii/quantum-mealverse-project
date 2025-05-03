
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  criteria: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  duration: number;
  calories_burned: number;
  exercises: string[];
  name?: string;  // Added for compatibility
}

export interface UserWorkoutStats {
  total_workouts?: number;
  total_time?: number;
  calories_burned?: number;
  streak_days?: number;
  streak?: number;  // Added for compatibility
  most_active_day?: string;  // Added for compatibility
  achievements?: number;
  recent_workouts?: WorkoutLog[];
  top_exercises?: string[];
}

export interface SavedMealPlanWithExpiry extends SavedMealPlan {
  is_active?: boolean;
  expires_at?: string;
}

export interface SavedMealPlan {
  id?: string;
  user_id?: string;
  name?: string;
  meal_plan?: any;
  tdee_id?: string;
  date_created?: string;
}

// Adding UserAchievement interface
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  date_achieved: string;
  progress?: number;
}

// Adding missing types from fitness.d.ts for consistency
export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  height?: number;
  weight: number;
  goal_weight?: number;
  date_of_birth?: string | null;
  gender?: string;
  fitness_level?: string;
  fitness_goals?: string[];
  dietary_preferences?: string[];
  dietary_restrictions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  body_fat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  legs?: number;
  notes?: string;
}

export interface WorkoutHistoryItem {
  id: string;
  user_id: string;
  workout_log_id: string;
  date: string;
  workout_plan_name: string;
  workout_day_name: string;
  exercises_completed: number;
  total_exercises: number;
  duration: number;
  calories_burned?: number;
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
  completed?: boolean;
}

export interface WorkoutSet {
  set_number: number;
  weight: number;
  reps: number | string;
  completed: boolean;
  notes?: string;
  exercise_id?: string;
  exercise_name?: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string;
  requirements: Record<string, any>;
  completed: boolean;
  deadline?: string;
}
