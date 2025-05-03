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
  user_id?: string;
  date: string;
  duration: number;
  calories_burned: number;
  exercises?: string[];
  name?: string;  // Added for compatibility
  workout_plan_id?: string;
  notes?: string;
  completed_exercises?: CompletedExercise[];
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
  is_active?: boolean;
  expires_at?: string;
}

// Adding UserAchievement interface
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  date_achieved: string;
  date_earned?: string; // For compatibility
  progress?: number;
}

// Adding missing types from fitness.d.ts for consistency
export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  height?: number;
  weight?: number;  // Changed to optional to match database
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

// Added missing interfaces for workout planner components
export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  goal?: string;
  difficulty?: string;
  frequency?: number;
  duration_weeks?: number;
  workout_days: WorkoutDay[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutDay {
  id?: string;
  day_name: string;
  day_number?: number;
  name?: string;
  target_muscle_groups?: string[];
  exercises: Exercise[];
  completed?: boolean;
}

export interface CompletedExercise {
  exercise_id?: string;
  name: string;
  exercise_name?: string;
  sets_completed: WorkoutSet[];
  notes?: string;
  sets?: number;
  reps?: number | string;
  weight?: number;
  weight_used?: number[];
  reps_completed?: number[];
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

// Add FitnessGoal interface for goal management components
export interface FitnessGoal {
  id: string;
  user_id: string;
  title: string;
  name?: string;  // Added for compatibility with database
  description?: string;
  target_value: number;
  current_value: number;
  start_date: string;
  target_date: string;
  category: string;
  target_weight?: number;     // Added for database compatibility  
  target_body_fat?: number;   // Added for database compatibility
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'active' | 'abandoned';
  created_at?: string;
  updated_at?: string;
}

// Add Team Challenge interfaces
export interface Team {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  created_by?: string;
  created_at: string;
  member_count: number;
  total_points: number;
  avatar_url?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_date: string;
  joined_at?: string;
  points_contributed: number;
  contribution_points?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  goal_type?: string;
  created_by: string;
  start_date: string;
  end_date: string;
  target_value: number;
  goal_value?: number;
  reward_points: number;
  participants_count: number;
  team_id?: string;
  is_active: boolean;
  status: string;
}

// Streak rewards interfaces
export interface StreakReward {
  id: string;
  streak_days: number;
  days?: number;
  streak_length?: number;
  reward_name: string;
  title?: string;
  reward_description: string;
  reward_type: string;
  reward_value: string;
  icon: string;
  points: number;
}

export interface StreakRewardsProps {
  userId?: string;
  currentStreak?: number;
  longestStreak?: number;
}

export interface WorkoutRecommendation {
  id: string;
  name?: string;
  title?: string;
  description: string;
  difficulty?: string;
  duration?: number;
  calories_burned?: number;
  category?: string;
  image_url?: string;
  reason?: string;
  type?: string;
  confidence_score?: number;
  user_id?: string;
  suggested_at?: string;
  dismissed?: boolean;
  applied?: boolean;
  applied_at?: string;
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
