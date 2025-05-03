export type GoalStatus = 'completed' | 'active' | 'not_started' | 'in_progress' | 'failed' | 'abandoned';

export interface FitnessGoal {
  id: string;
  user_id: string;
  title: string;
  name: string;
  description: string;
  target_value: number;
  current_value: number;
  start_date: string;
  target_date: string;
  category: string;
  status: GoalStatus;
  target_weight?: number;
  target_body_fat?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  currentstreak: number;
  longeststreak: number;
  last_activity_date: string;
  streak_type: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  date_achieved: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  goal_type?: string;
  target_value: number;
  type: string;
  status?: string;
  team_id?: string;
  created_by: string;
  is_active: boolean;
  reward_points?: number;
  participants_count?: number;
}

export interface ChallengeParticipant {
  id: string;
  user_id: string;
  challenge_id: string;
  team_id?: string;
  joined_date: string;
  progress: number;
  completed: boolean;
}

export interface SavedMealPlanWithExpiry {
  id: string;
  user_id: string;
  name: string;
  meal_plan: any;
  expires_at?: string;
  is_active: boolean;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  difficulty: string;
  frequency: number;
  duration_weeks: number;
  goal: string;
  workout_days: WorkoutDay[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  rest_time: number;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_plan_id: string;
  date: string;
  duration: number;
  calories_burned: number;
  notes?: string;
  exercises_completed: ExerciseLog[];
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseLog {
  exercise_id: string;
  sets_completed: number;
  reps_completed: string;
  weight_used?: number;
}

export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  day_of_week: string;
  time: string;
  reminder: boolean;
  created_at?: string;
  updated_at?: string;
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
  calories_burned: number;
}
