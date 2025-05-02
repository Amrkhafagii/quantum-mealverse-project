
import { MealPlan } from './food';
import { Json } from '@/types/database';

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  date_created: string;
  meal_plan: MealPlan;
  tdee_id: string;
  expires_at: string;
  is_active: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  height?: number;
  weight: number;
  goal_weight?: number;
  date_of_birth?: Date;
  gender?: string;
  fitness_level?: string;
  fitness_goal?: string;
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

export interface UserWorkoutStats {
  streak: number;
  total_workouts: number;
  most_active_day?: string;
  achievements_count?: number;
  points?: number;
  level?: number;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  goal: string;
  frequency: number;
  difficulty: string;
  duration_weeks: number;
  created_at: string;
  updated_at: string;
  workout_days: WorkoutDay[];
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: Exercise[];
  day_number: number;
  target_muscle_groups: string[];
}

export interface Exercise {
  id: string;
  exercise_id?: string;
  exercise_name?: string;
  name: string;
  sets: number;
  reps: number | string;
  weight?: number;
  duration?: string | number;
  rest?: number;
  rest_time?: number;
  rest_seconds?: number;
  target_muscle?: string;
  instructions?: string;
  equipment?: string;
  video_url?: string;
}

export interface WorkoutSet {
  id?: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  completed: boolean;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_plan_id: string;
  date: string;
  duration: number;
  calories_burned?: number;
  notes?: string;
  completed_exercises: CompletedExercise[];
}

export interface CompletedExercise {
  exercise_id: string;
  name: string;
  sets_completed: {
    set_number: number;
    weight: number;
    reps: number;
    completed: boolean;
  }[];
}

export interface WorkoutHistoryItem {
  id: string;
  user_id: string;
  date: string;
  workout_log_id: string;
  workout_plan_name: string;
  workout_day_name: string;
  workout_name?: string;
  duration: number;
  exercises_completed: number;
  total_exercises: number;
  exercises_count?: number;
  calories_burned: number;
}

export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  start_date: string;
  end_date?: string;
  days_of_week: number[];
  preferred_time?: string;
  active: boolean;
}

export interface FitnessGoal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  target_weight?: number;
  target_body_fat?: number;
  target_date?: string;
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

export interface StreakReward {
  id: string;
  streak_days: number;
  reward_name: string;
  reward_description: string;
  points: number;
}

export interface StreakRewardsProps {
  userId?: string;
  currentStreak: number;
  onClaimReward: (rewardId: string) => void;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  created_at: string;
  member_count: number;
  total_points: number;
  avatar_url?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'member' | 'admin';
  joined_date: string;
  points_contributed: number;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  type: string;
  created_by: string;
  start_date: string;
  end_date: string;
  target_value: number;
  reward_points?: number;
  participants_count?: number;
  team_id?: string;
  is_active: boolean;
  goal_type?: string;
  status?: string;
}

export interface ChallengeParticipant {
  id: string;
  user_id: string;
  challenge_id: string;
  joined_date: string;
  progress: number;
  completed: boolean;
  completion_date?: string;
  team_id?: string;
}

export interface WorkoutRecommendation {
  id: string;
  user_id?: string;
  title?: string;
  description?: string;
  type?: string;
  suggested_at?: string;
  reason?: string;
  confidence_score?: number;
  applied?: boolean;
  applied_at?: string;
  dismissed?: boolean;
}

export interface DailyQuest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  completed: boolean;
  created_at: string;
  expires_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  currentstreak: number;
  longeststreak: number;
  last_activity_date: string;
  streak_type: string;
}
