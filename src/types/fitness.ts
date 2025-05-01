
import { MealPlan } from './food';

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

export interface UserTDEE {
  id: string;
  user_id: string;
  date: string;
  tdee: number;
  bmr: number;
  goal: 'maintain' | 'cut' | 'bulk';
  activity_level: string;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  notes?: string;
}

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  date_created: string;
  tdee_id?: string;
  meal_plan: MealPlan;
}

export interface FitnessGoal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  target_date?: string;
  status: 'active' | 'completed' | 'abandoned';
  target_weight?: number;
  target_body_fat?: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  gender?: string;
  date_of_birth?: string;
  height?: number;
  starting_weight?: number;
  goal_weight?: number;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  fitness_goals?: string[];
  dietary_preferences?: string[];
  dietary_restrictions?: string[];
  created_at: string;
  updated_at: string;
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
  user_id: string;
  achievement_id: string;
  date_achieved: string;
  achievement?: Achievement;
}

// Workout Types
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscle_groups: string[];
  equipment_needed?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  video_url?: string;
  image_url?: string;
}

export interface WorkoutSet {
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number; 
  weight?: number;
  duration?: number; // For timed exercises (in seconds)
  rest_time?: number; // Rest time in seconds
  completed: boolean;
  notes?: string;
}

export interface WorkoutDay {
  day_name: string; // e.g., "Monday", "Day 1", etc.
  exercises: WorkoutSet[];
  completed: boolean;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general';
  frequency: number; // Number of days per week
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  created_at: string;
  updated_at: string;
  workout_days: WorkoutDay[];
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_plan_id: string;
  date: string;
  duration: number; // In minutes
  calories_burned?: number;
  notes?: string;
  completed_exercises: {
    exercise_id: string;
    exercise_name: string;
    sets_completed: {
      set_number: number;
      weight?: number;
      reps?: number;
      duration?: number;
    }[];
  }[];
}

export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  start_date: string;
  end_date?: string;
  days_of_week: number[]; // 0 = Sunday, 6 = Saturday
  preferred_time?: string;
  active: boolean;
}

export interface UserStreak {
  id: string;
  user_id: string;
  currentStreak: number;
  longestStreak: number;
  last_activity_date: string;
  streak_type: 'workout' | 'nutrition' | 'measurement';
}

export interface ProgressAnalytics {
  user_id: string;
  date_range: {
    start: string;
    end: string;
  };
  weight_change?: number;
  body_fat_change?: number;
  strength_progress?: {
    exercise_id: string;
    exercise_name: string;
    start_weight: number;
    current_weight: number;
    improvement_percentage: number;
  }[];
  workout_consistency: number; // Percentage of planned workouts completed
  calories_burned_total?: number;
  achievement_count: number;
}

// New interfaces for workout history
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
  calories_burned?: number;
  workout_log?: WorkoutLog;
}

export interface UserWorkoutStats {
  user_id: string;
  totalWorkouts: number;
  total_time: number; // In minutes
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
  weekly_goal_completion: number; // Percentage
}
