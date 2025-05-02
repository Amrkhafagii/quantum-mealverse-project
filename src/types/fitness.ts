
import { MealPlan } from './food';

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  date_created: string;
  tdee_id: string;
  meal_plan: MealPlan;
  expires_at?: string;  // Field for expiration date
  is_active?: boolean;  // Field to track if plan is active
}

// User Profile Types
export interface UserProfile {
  id: string;
  user_id: string;
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitness_goal: 'weight_loss' | 'maintenance' | 'muscle_gain';
  created_at: string;
  updated_at?: string;
  goal_weight?: number;  // Added goal_weight property
  fitness_goals?: string[];  // Added fitness_goals array
}

// Measurement Tracking
export interface UserMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  body_fat_percentage?: number;
  body_fat?: number;  // Added body_fat property
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  legs?: number;  // Added legs property
  notes?: string;
}

// Workout Related Types
export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency: number;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  workout_days: WorkoutDay[];
  created_at: string;
  updated_at?: string;
  duration_weeks?: number;  // Added duration_weeks property
}

export interface WorkoutDay {
  id: string;
  day_name: string;
  focus: string;
  exercises: Exercise[];
  completed?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  target_muscle: string;
  sets: number;
  reps: number | string;
  rest_seconds?: number;
  weight?: number | null;
  notes?: string;
  video_url?: string;
  image_url?: string;
  exercise_id?: string;  // Added exercise_id property
  exercise_name?: string;  // Added exercise_name property
  rest_time?: number;  // Added rest_time property
  rest?: number;  // Added rest property
  duration?: string | number;  // Added duration property
}

export interface WorkoutSet {
  set_number: number;
  weight: number;
  reps: number;
  completed?: boolean;
  is_warmup?: boolean;
}

export interface CompletedExercise {
  exercise_id: string;
  exercise_name: string;
  sets_completed: WorkoutSet[] | number;
  notes?: string;
}

export interface CompletedExerciseData {
  exercise_id: string;
  name: string;
  exercise_name: string;
  sets_completed: WorkoutSet[];
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_plan_id?: string;
  date: string;
  duration: number;
  calories_burned?: number | null;
  notes?: string | null;
  mood?: 'great' | 'good' | 'average' | 'poor' | null;
  completed_exercises: CompletedExercise[];
}

export interface WorkoutHistoryItem {
  id: string;
  date: string;
  workout_name: string;
  duration: number;
  calories_burned?: number;
  exercises_count: number;
  workout_log_id: string;
  exercises_completed?: number;  // Added exercises_completed property
  total_exercises?: number;  // Added total_exercises property
  workout_plan_name?: string;  // Added workout_plan_name property
  workout_day_name?: string;  // Added workout_day_name property
}

export interface UserWorkoutStats {
  total_workouts: number;
  total_duration: number;
  total_calories: number;
  streak: number;
  most_active_day: string;
  favorite_exercise: string;
  weight_lifted: number;
  completion_rate: number;
  currentStreak?: number;  // Added currentStreak property
  longestStreak?: number;  // Added longestStreak property
  total_time?: number;  // Added total_time property
  strongest_exercise?: {  // Added strongest_exercise property
    exercise_name: string;
    max_weight: number;
  };
  most_improved_exercise?: {  // Added most_improved_exercise property
    exercise_name: string;
    improvement_percentage: number;
  };
  weekly_goal_completion?: number;  // Added weekly_goal_completion property
}

export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  start_date: string;
  days_of_week: number[];
  reminder_time?: string;
  created_at: string;
  active?: boolean;  // Added active property
  preferred_time?: string;  // Added preferred_time property
  end_date?: string;  // Added end_date property
}

export interface WorkoutRecommendation {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  target_goal: string;
  workout_days: WorkoutDay[];
  thumbnail_url?: string;
  rating?: number;
  duration_estimate: string;
  equipment_needed: string[];
}

// Achievement System Types
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

// Streak & Rewards System
export interface UserStreak {
  id: string;
  user_id: string;
  currentstreak: number;
  longeststreak: number;
  last_activity_date: string;
  streak_type: 'workout' | 'nutrition' | 'meditation';
}

export interface StreakReward {
  id: string;
  streak_length: number;
  reward_description: string;
  reward_type: 'badge' | 'points' | 'discount' | 'feature';
  reward_value: number | string;
  icon: string;
}

// Goals System
export interface FitnessGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'weight' | 'nutrition' | 'workout' | 'measurement' | 'habit';
  target_value: number;
  current_value: number;
  start_date: string;
  target_date: string;
  completed: boolean;
  completed_date?: string;
  color?: string;
  units?: string;
}

// Team & Challenges
export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  member_count: number;
  avatar_url?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  joined_date: string;
  role: 'admin' | 'member';
  points_contributed: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'steps' | 'workouts' | 'weight' | 'nutrition' | 'distance';
  target_value: number;
  start_date: string;
  end_date: string;
  created_by: string;
  team_id?: string;
  participants_count: number;
  prize_description?: string;
  rules?: string;
  is_active: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: 'workout' | 'nutrition' | 'wellness' | 'steps';
  points: number;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  user_id?: string;  // Added user_id property
  completed?: boolean;  // Added completed property
  created_at?: string;  // Added created_at property
  expires_at?: string;  // Added expires_at property
  expiry_hours?: number;  // Added expiry_hours property
}
