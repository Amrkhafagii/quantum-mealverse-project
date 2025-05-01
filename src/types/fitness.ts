
// Define types for fitness data that can be used throughout the application
export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  goal: string;
  frequency: number;
  difficulty: string;
  duration_weeks: number;
  created_at: string;
  updated_at: string;
  workout_days: WorkoutDay[];
}

export interface WorkoutDay {
  name: string;
  day_name?: string; // Adding this to fix compatibility issues
  exercises: Exercise[];
  order: number;
}

export interface Exercise {
  id: string;
  exercise_id?: string; // Adding this to fix compatibility issues
  name: string;
  exercise_name?: string; // Adding this to fix compatibility issues
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  rest?: number;
  rest_time?: number; // Adding this to fix compatibility issues
  notes?: string;
  completed?: boolean;
  category?: string;
  muscle_group?: string;
}

// Adding this type to fix compatibility issues
export interface WorkoutSet {
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  rest_time?: number;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_plan_id: string;
  date: string;
  duration: number;
  calories_burned: number | null;
  notes: string | null;
  completed_exercises: CompletedExercise[];
}

export interface CompletedExercise {
  exercise_id: string;
  name: string;
  exercise_name?: string; // Adding this to fix compatibility issues
  sets_completed: number | { set_number: number; weight: number; reps: number }[];
  reps_completed: number[];
  weight_used: number[];
  notes?: string;
}

export interface WorkoutHistoryItem {
  id: string;
  user_id: string;
  date: string;
  workout_log_id: string;
  workout_plan_name: string;
  workout_day_name: string;
  duration: number;
  exercises_completed: number;
  total_exercises: number;
  calories_burned: number | null;
}

export interface UserStreak {
  id: string;
  user_id: string;
  currentstreak: number;
  longeststreak: number;
  last_activity_date: string;
  streak_type: string;
}

export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  start_date: string;
  end_date: string | null;
  days_of_week: number[];
  preferred_time: string | null;
  active: boolean;
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

export interface FitnessGoal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  target_date: string | null;
  target_weight: number | null;
  target_body_fat: number | null;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  criteria: string;
  icon: string;
  points: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  date_achieved: string;
}

// Adding missing types that are referenced in error messages
export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  gender?: string;
  date_of_birth?: string;
  height?: number;
  goal_weight?: number;
  fitness_level?: string;
  fitness_goals?: string[];
  dietary_preferences?: string[];
  dietary_restrictions?: string[];
  created_at: string;
  updated_at: string;
}

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  meal_plan: any; // JSON structure
  date_created: string;
  tdee_id?: string;
}

export interface UserWorkoutStats {
  user_id: string;
  totalWorkouts: number;
  total_time: number;
  total_calories: number;
  favorite_exercise: string;
  strongest_exercise: {
    exercise_id: string;
    exercise_name: string;
    max_weight: number;
  };
  most_improved_exercise: {
    exercise_id: string;
    exercise_name: string;
    improvement_percentage: number;
  };
  currentStreak: number;
  longestStreak: number;
  weekly_goal_completion: number;
}
