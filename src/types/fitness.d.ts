
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
  workout_plans_user_id?: string; // Added for database compatibility
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
  rest_time?: number; // Added missing property
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
  // Make it compatible with WorkoutLog
  workout_plan_id?: string;
  completed_exercises?: CompletedExercise[];
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
  date_earned: string;
  progress?: number;
}

// UserWorkoutStats interface - Updated to include all necessary fields
export interface UserWorkoutStats {
  user_id?: string;
  total_workouts: number;
  streak_days: number;
  longest_streak: number;
  total_calories_burned: number;
  total_duration_minutes: number;
  most_active_day: string;
  streak?: number; // alias for streak_days
  achievements?: number;
  recent_workouts?: Array<{
    name: string;
    date: string;
    duration: number;
  }>;
}

// SavedMealPlan interface with required fields matching the database requirements
export interface SavedMealPlan {
  id?: string; 
  user_id: string;
  name: string;
  meal_plan: any;
  tdee_id?: string;
  date_created?: string;
  is_active: boolean;
  expires_at?: string;
}

// Update the SavedMealPlanWithExpiry interface to match our changes
export interface SavedMealPlanWithExpiry extends SavedMealPlan {
  // No additional fields needed as is_active is now in the base interface
}

// These are the types consumed by various components:

export type DailyQuest = {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string;
  requirements: any;
  completed: boolean;
  deadline?: string;
};

export type FitnessGoal = {
  id: string;
  fitness_goals_user_id: string;
  user_id?: string; // ADDED for v2/x-compatibility in analytics
  name: string;
  description: string; // Made required to match database
  target_value: number;
  current_value: number;
  target_date: string;
  status: GoalStatus;
  goal_type: string;
  created_at?: string;
  updated_at?: string;
  // Backward compatibility
  title?: string;
  target_weight?: number;
  target_body_fat?: number;
  category?: string;
  type?: string;
  start_date?: string;
  is_active?: boolean;
};
export type GoalStatus = 'active' | 'completed' | 'not_started' | string;

export type Team = {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  created_at: string;
  member_count: number;
  total_points: number;
};

export type TeamMember = {
  id: string;
  user_id: string;
  team_id: string;
  role: 'leader' | 'member';
  joined_at: string;
  name?: string; // Added for display purposes
  points?: number; // Added for display purposes
};

// Calendar event type needed for scheduling
export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // ISO string
  status?: string; // completed, in_progress, etc. - made optional
  time?: string;
};
