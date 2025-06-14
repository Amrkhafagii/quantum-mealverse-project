
// Re-export all fitness types from their specific files
export * from './goals';
export * from './achievements';
export * from './challenges';
export * from './nutrition';
export * from './logs';
export * from './analytics';
export * from './recommendations';
export * from './scheduling';
export * from './profile';
export * from './exercises';

// Export from workouts file, avoiding duplicates
export type {
  WorkoutPlan,
  WorkoutDay,
  Exercise,
  CompletedExercise,
  ExerciseSet,
  WorkoutSet,
  WorkoutSchedule,
  WorkoutHistoryItem,
  WorkoutRecommendation,
  UserWorkoutStats,
  WorkoutLog
} from './workouts';

// Additional types for UI components
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

// Additional types related to hydration tracking
export interface HydrationData {
  targetIntake: number;
  currentIntake: number;
  lastUpdated: string;
  glassSize: number;
}

// Export ExtendedUserAchievement properly
export interface ExtendedUserAchievement extends UserAchievement {
  achievement: Achievement;
  date_achieved?: string;
}

// Make sure UserMeasurement is properly exported from profile
export type { UserMeasurement } from './profile';

// Additional missing types
export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  created_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: 'leader' | 'member';
  joined_at: string;
}

export interface StreakReward {
  id: string;
  days: number;
  days_required?: number;
  streak_days?: number;
  streak_length?: number;
  reward_type: 'points' | 'badge' | 'item';
  reward_value: number | string;
  reward_name?: string;
  title?: string;
  reward_description?: string;
  description?: string;
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

// Updated SavedMealPlan to match database schema
export interface SavedMealPlan {
  id: string;
  saved_meal_plans_user_id: string;
  name: string;
  meal_plan: any; // JSON data containing the meal plan
  tdee_id: string;
  date_created: string;
  expires_at?: string;
  is_active?: boolean;
}
