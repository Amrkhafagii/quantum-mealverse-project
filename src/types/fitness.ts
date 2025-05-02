
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
  day_name: string; // Keep this consistent for compatibility
  exercises: Exercise[];
  order: number;
  completed?: boolean;
}

export interface Exercise {
  id: string;
  exercise_id: string; // Keep this consistent for compatibility
  name: string;
  exercise_name: string; // Keep this consistent for compatibility
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  rest?: number;
  rest_time?: number; // Keep this consistent for compatibility
  notes?: string;
  completed?: boolean;
  category?: string;
  muscle_group?: string;
}

// This type is for compatibility with existing components
export interface WorkoutSet {
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  rest_time?: number;
  completed?: boolean;
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
  exercise_name: string; // Keep this consistent for compatibility
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
  level?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  date_achieved: string;
  achievement?: Achievement;
}

// User profile type
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

// Saved meal plan type
export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  meal_plan: any; // JSON structure
  date_created: string;
  tdee_id?: string;
}

// User workout statistics
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

// Daily quest type
export interface DailyQuest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  created_at: string;
  expires_at: string;
}

// User points system
export interface UserPoints {
  user_id: string;
  total_points: number;
  level: string;
  progress_to_next_level: number;
  last_updated: string;
}

// New interfaces for advanced gamification
export interface Team {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  created_at: string;
  avatar_url?: string;
  members_count: number;
  total_points: number;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  joined_at: string;
  role: 'member' | 'admin' | 'creator';
  contribution_points: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  type: 'individual' | 'team';
  status: 'upcoming' | 'active' | 'completed';
  goal_type: 'distance' | 'workouts' | 'steps' | 'weight' | 'custom';
  goal_value: number;
  reward_points: number;
  participants_count?: number;
}

export interface ChallengeParticipant {
  challenge_id: string;
  user_id: string;
  team_id?: string;
  joined_at: string;
  current_progress: number;
  completed: boolean;
  completed_at?: string;
}

// Enhanced streak rewards
export interface StreakReward {
  days: number;
  points: number;
  description: string;
  claimed: boolean;
}

// AI-Powered Recommendations
export interface WorkoutRecommendation {
  id: string;
  user_id: string;
  workout_plan_id?: string;
  type: 'plan' | 'exercise' | 'rest' | 'adjustment' | 'equipment';
  title: string;
  description: string;
  reason: string;
  confidence_score: number; // 0-100
  suggested_at: string;
  applied: boolean;
  applied_at?: string;
  dismissed: boolean;
  metadata?: any;
}
