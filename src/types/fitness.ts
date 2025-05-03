export interface Achievement {
  name: string;
  description: string;
  icon: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  duration: number;
  calories_burned: number;
  exercises: string[];
}

export interface UserWorkoutStats {
  total_workouts?: number;
  total_time?: number;
  calories_burned?: number;
  streak_days?: number;
  achievements?: Achievement[];
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
