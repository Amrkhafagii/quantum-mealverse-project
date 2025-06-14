// Re-export all fitness types from their respective modules
export * from './analytics';
export * from './exercises';
export * from './profile';
export * from './recommendations';
export * from './scheduling';

// Keep some legacy exports for backward compatibility
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
  exercises: import('./exercises').Exercise[];
  id?: string;
  name?: string;
  day_number?: number;
  target_muscle_groups?: string[];
  completed?: boolean;
}

export interface WorkoutLog {
  id?: string;
  user_id: string;
  workout_logs_user_id?: string;
  workout_plan_id: string;
  date: string;
  duration: number;
  calories_burned?: number | null;
  notes?: string | null;
  completed_exercises: CompletedExercise[];
  exercises_completed?: any[];
}

export interface CompletedExercise {
  exercise_id: string;
  name: string;
  exercise_name: string;
  sets_completed: WorkoutSet[];
  notes?: string;
  sets?: number;
  reps?: number | string;
  weight?: number;
  weight_used?: number[];
  reps_completed?: number[];
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

export interface FitnessGoal {
  id: string;
  fitness_goals_user_id: string;
  name: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  target_date: string;
  status: GoalStatus;
  goal_type: string;
  created_at: string;
  updated_at: string;
  title?: string;
  target_weight?: number;
  target_body_fat?: number;
  category?: string;
  type?: string;
  start_date?: string;
  is_active?: boolean;
}

export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

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
  user_achievements_user_id: string;
  achievement_id: string;
  date_earned: string;
  progress?: number;
  user_id?: string;
  unlocked_at?: string;
  date_achieved?: string;
}

export interface ExtendedUserAchievement extends UserAchievement {
  achievement: Achievement;
}

export interface UserWorkoutStats {
  total_workouts?: number;
  streak?: number;
  streak_days?: number;
  achievements?: number;
  most_active_day?: string;
  calories_burned?: number;
  recent_workouts?: Array<{
    name: string;
    date: string;
    duration: number;
  }>;
}
