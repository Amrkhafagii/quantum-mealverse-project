
export interface WorkoutPlan {
  id: string; // Made required to match database expectations
  user_id: string; // Changed from number to string (UUID)
  name: string;
  description?: string;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  frequency: number;
  duration_weeks: number;
  workout_days: WorkoutDay[];
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface WorkoutLog {
  id?: string;
  user_id: string; // Changed from number to string (UUID)
  workout_plan_id?: string;
  date: string;
  duration?: number;
  calories_burned?: number;
  notes?: string;
  completed_exercises: CompletedExercise[]; // Keep this name consistent
  exercises_completed?: CompletedExercise[]; // Add alias for backward compatibility
  created_at?: string;
}

export interface ExerciseSet {
  id?: string;
  user_id: string; // Changed from number to string (UUID)
  exercise_name: string;
  weight: number;
  reps: number;
  rest_time?: number;
  notes?: string;
  workout_log_id?: string;
  created_at?: string;
}

export interface WorkoutSchedule {
  id?: string;
  user_id: string; // Changed from number to string (UUID)
  workout_plan_id?: string;
  day_of_week?: number;
  days_of_week: number[];
  time?: string;
  preferred_time?: string;
  reminder?: boolean;
  start_date?: string;
  end_date?: string;
  active?: boolean;
}

export interface WorkoutHistoryItem {
  id: string;
  user_id: string; // Changed from number to string (UUID)
  workout_log_id?: string;
  date: string;
  workout_plan_name: string;
  workout_day_name: string;
  duration: number;
  exercises_completed: number;
  total_exercises: number;
  calories_burned?: number;
  created_at?: string;
}

export interface SavedMealPlan {
  id: string;
  user_id: string; // Changed from number to string (UUID)
  name: string;
  description?: string;
  meals: any[];
  meal_plan?: any; // Add this missing property
  nutritional_targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags?: string[];
  is_favorite?: boolean;
  is_active?: boolean; // Add this missing property
  expires_at?: string; // Add this missing property
  date_created?: string; // Add this missing property
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutDay {
  day_name: string;
  exercises: Exercise[];
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
  rest: number;
  rest_time?: number;
  rest_seconds?: number;
  notes?: string;
  preparation_time?: number;
  duration?: number;
}

export interface CompletedExercise {
  exercise_id?: string;
  name?: string; // Add this missing property
  exercise_name: string;
  sets_completed: number;
  reps_completed: number[];
  weight_used: number[];
  notes?: string;
}

export interface UserProfile {
  id: string;
  user_id: string; // Changed from number to string (UUID)
  height?: number;
  weight?: number;
  goal_weight?: number; // Add this missing property
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  fitness_goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_endurance';
  fitness_goals?: string[]; // Add this missing property
  fitness_level?: string; // Add this missing property
  display_name?: string; // Add this missing property
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseProgress {
  id?: string;
  user_id: string; // Changed from number to string (UUID)
  exercise_name: string;
  workout_log_id?: string;
  max_weight?: number;
  max_reps?: number;
  total_volume?: number;
  one_rep_max?: number;
  recorded_date: string;
  created_at?: string;
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
  user_id: string; // Changed from number to string (UUID)
  achievement_id: string;
  unlocked_at: string; // Make this required since ExtendedUserAchievement expects it
  date_achieved?: string; // Add this missing property as optional
  progress?: number;
}

export interface ExtendedUserAchievement extends UserAchievement {
  achievement: Achievement;
  date_achieved?: string; // Add this missing property
}

// Add missing interfaces
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

export interface UserWorkoutStats {
  user_id: string;
  total_workouts: number;
  streak_days: number;
  longest_streak: number;
  total_calories_burned: number;
  total_duration_minutes: number;
  most_active_day: string;
  calories_burned?: number;
  streak?: number;
  achievements?: number; // Add this missing property
}

export interface WorkoutSet {
  id?: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  rest_time?: number;
  completed?: boolean;
}

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

export interface FitnessGoal {
  id: string;
  user_id: string;
  type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength';
  target_value: number;
  current_value: number;
  target_date: string;
  created_at: string;
  is_active: boolean;
  // Add missing properties that components expect
  title?: string;
  name?: string;
  description?: string;
  status?: 'completed' | 'active' | 'not_started' | 'in_progress' | 'failed' | 'abandoned';
  target_weight?: number;
  target_body_fat?: number;
  start_date?: string;
  category?: string;
  updated_at?: string;
}

// Add missing types for other components
export interface StreakReward {
  id: string;
  days_required: number;
  streak_days?: number;
  days?: number;
  streak_length?: number;
  reward_name: string;
  title?: string;
  reward_description: string;
  reward_value: number | string;
  reward_type?: string;
  reward_image?: string;
  icon?: string;
  points?: number;
  is_claimed?: boolean;
}

export interface StreakRewardsProps {
  currentStreak: number;
  rewards: StreakReward[];
  userId?: string;
  longestStreak?: number;
  onClaimReward?: (rewardId: string) => void;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  target_value: number;
  created_by: string;
  team_id?: string;
  is_active: boolean;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'member' | 'admin' | 'owner';
  joined_date: string;
  is_active: boolean;
}
