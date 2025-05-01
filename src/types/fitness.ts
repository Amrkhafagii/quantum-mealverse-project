
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
  exercises: Exercise[];
  order: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  rest?: number;
  notes?: string;
  completed?: boolean;
  category?: string;
  muscle_group?: string;
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
  sets_completed: number;
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
