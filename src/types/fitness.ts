
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
}

// Measurement Tracking
export interface UserMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  body_fat_percentage?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
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
}

export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  start_date: string;
  days_of_week: number[];
  reminder_time?: string;
  created_at: string;
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
  target_value: number;
  points_reward: number;
  icon: string;
  expiry_hours: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
