
// User profile types
export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  height?: number;
  weight: number; // Required field
  goal_weight?: number;
  date_of_birth?: string | null; // Changed from Date to string | null to match database
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

// Workout types
export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  goal: string;
  difficulty: string;
  frequency: number;
  duration_weeks: number;
  workout_days: WorkoutDay[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutDay {
  day_name: string;
  exercises: Exercise[];
  id?: string;
  name?: string;
  day_number?: number;
  target_muscle_groups?: string[];
  completed?: boolean;
}

export interface Exercise {
  id?: string;
  exercise_id?: string;
  name: string;
  exercise_name?: string; // Alternative name field
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
  exercise_id?: string; // Added for compatibility
  exercise_name?: string; // Added for compatibility
}

export interface CompletedExercise {
  exercise_id: string;
  name: string;
  exercise_name: string;
  sets_completed: WorkoutSet[];
  notes?: string;
  // Added for backward compatibility
  sets?: number;
  reps?: number | string;
  weight?: number;
  weight_used?: number[];
  reps_completed?: number[];
}

export interface WorkoutLog {
  id?: string;
  user_id: string;
  workout_plan_id: string;
  date: string;
  duration: number;
  calories_burned?: number | null;
  notes?: string | null;
  completed_exercises: CompletedExercise[];
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

export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  days_of_week: number[];
  start_date: string;
  end_date?: string;
  preferred_time?: string;
  active: boolean;
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  criteria: string;
  icon: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  date_achieved: string;
}

// Stats types
export interface UserWorkoutStats {
  streak: number;
  total_workouts: number;
  most_active_day: string;
  avg_duration?: number;
  total_calories_burned?: number;
  currentStreak?: number;
  longestStreak?: number;
  achievements_count?: number;
  points?: number;
  level?: number;
}

// Recommendation types
export interface WorkoutRecommendation {
  id: string;
  user_id?: string;
  title?: string;
  name?: string;
  description?: string;
  type?: string;
  reason?: string;
  confidence_score?: number;
  suggested_at?: string;
  dismissed?: boolean;
  applied?: boolean;
  applied_at?: string;
}

// Nutrition types
export interface MealPlan {
  id?: string;
  name?: string;
  description?: string;
  meals?: Meal[];
  totalCalories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  total_calories?: number;
}

export interface Meal {
  id?: string;
  name: string;
  time?: string;
  foods: MealFood[];
}

export interface MealFood {
  id?: string;
  name?: string;
  quantity: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  serving_size?: number;
  unit?: string;
}

export interface Food {
  id?: string;
  name: string;
  category?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  serving_size?: number;
  unit?: string;
  allergies?: string[];
}
