import { MealPlan } from './food';
import { Json } from '@/types/database';

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  date_created: string;
  tdee_id: string;
  meal_plan: Json | MealPlan;
  expires_at: string | null;
  is_active: boolean;
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
  goal_weight?: number;
  fitness_goals?: string[];
  dietary_preferences?: string[];
  dietary_restrictions?: string[];
  display_name?: string;
  date_of_birth?: string;
  fitness_level?: string;
}

// Measurement Tracking
export interface UserMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  body_fat_percentage?: number;
  body_fat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  legs?: number;
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
  duration_weeks?: number;
}

export interface WorkoutDay {
  id: string;
  day_name: string;
  focus: string;
  exercises: Exercise[];
  completed?: boolean;
  name?: string; // Add this for backward compatibility
  order?: number; // Add this for backward compatibility
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
  exercise_id?: string;
  exercise_name?: string;
  rest_time?: number;
  rest?: number;
  duration?: string | number;
  completed?: boolean;
}

export interface WorkoutSet {
  set_number: number;
  weight: number;
  reps: number;
  completed?: boolean;
  is_warmup?: boolean;
  id?: string; // Add this for compatibility
  exercise_id?: string; // Add this for compatibility
  exercise_name?: string; // Add this for compatibility
  duration?: number | string; // Add this for compatibility
  rest_time?: number; // Add this for compatibility
}

export interface CompletedExercise {
  exercise_id: string;
  exercise_name: string;
  name: string;
  sets_completed: WorkoutSet[] | number;
  notes?: string;
  reps_completed?: any[];
  weight_used?: any[];
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
  exercises_completed?: number;
  total_exercises?: number;
  workout_plan_name?: string;
  workout_day_name?: string;
  user_id?: string;
}

export interface UserWorkoutStats {
  total_workouts: number;
  totalWorkouts?: number; // Alias for total_workouts for backward compatibility
  total_duration: number;
  total_time?: number; // Alias for total_duration
  total_calories: number;
  streak: number;
  most_active_day: string;
  favorite_exercise: string;
  weight_lifted: number;
  completion_rate: number;
  currentStreak?: number;
  longestStreak?: number;
  strongest_exercise?: {
    exercise_name: string;
    max_weight: number;
  };
  most_improved_exercise?: {
    exercise_name: string;
    improvement_percentage: number;
  };
  weekly_goal_completion?: number;
}

export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  start_date: string;
  days_of_week: number[];
  reminder_time?: string;
  created_at: string;
  active?: boolean;
  preferred_time?: string;
  end_date?: string;
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
  dismissed?: boolean;
  applied?: boolean;
  applied_at?: string;
  type?: string;
  title?: string;
  confidence_score?: number;
  reason?: string;
  user_id?: string;
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
  streak_type: 'workout' | 'nutrition' | 'meditation' | string;
}

export interface StreakReward {
  id: string;
  streak_length: number;
  reward_description: string;
  reward_type: 'badge' | 'points' | 'discount' | 'feature';
  reward_value: number | string;
  icon: string;
  days?: number;
  title?: string;
}

export interface StreakRewardsProps {
  userId?: string;
  currentStreak?: number;
  longestStreak?: number;
}

// Goals System
export interface FitnessGoal {
  id: string;
  user_id: string;
  name: string;
  title?: string; // Optional to be backward compatible
  description?: string;
  category?: 'weight' | 'nutrition' | 'workout' | 'measurement' | 'habit';
  target_value?: number;
  current_value?: number;
  start_date?: string;
  target_date?: string;
  completed?: boolean;
  completed_date?: string;
  color?: string;
  units?: string;
  status?: 'active' | 'completed' | 'abandoned';
  created_at?: string;
  updated_at?: string;
  target_weight?: number;
  target_body_fat?: number;
}

// Team & Challenges
export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  creator_id?: string; // Added for TeamChallenges compatibility
  created_at: string;
  member_count: number;
  members_count?: number; // Alias for backward compatibility 
  avatar_url?: string;
  total_points?: number; // Added for TeamChallenges compatibility
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  joined_date: string;
  joined_at?: string; // Alias for backward compatibility
  role: 'admin' | 'member';
  points_contributed: number;
  contribution_points?: number; // Alias for backward compatibility
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'steps' | 'workouts' | 'weight' | 'nutrition' | 'distance' | 'individual' | 'team';
  target_value: number;
  start_date: string;
  end_date: string;
  created_by: string;
  team_id?: string;
  participants_count: number;
  prize_description?: string;
  rules?: string;
  is_active: boolean;
  status?: string; // Added for TeamChallenges compatibility
  goal_value?: number; // Added for TeamChallenges compatibility
  goal_type?: string; // Added for TeamChallenges compatibility
  reward_points?: number; // Added for TeamChallenges compatibility
}

// For use in gamificationService.ts
export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  team_id?: string;
  joined_date: string;
  progress: number;
  completed: boolean;
  completion_date?: string;
}

export interface UserPreferences {
  user_id: string;
  id?: string;
  dietary_restrictions?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  calorie_target?: number | null;
  protein_target?: number | null;
  carbs_target?: number | null;
  fat_target?: number | null;
  allergies?: string[] | null;
  currency?: string;
  location_tracking_enabled?: boolean | null;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: 'workout' | 'nutrition' | 'wellness' | 'steps';
  points: number;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  user_id?: string;
  completed?: boolean;
  created_at?: string;
  expires_at?: string;
  expiry_hours?: number;
}
