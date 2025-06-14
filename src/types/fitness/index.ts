
// Explicitly export all required types

export type {
  // User/Profile
  UserProfile,
  UserMeasurement,
  // Workouts
  WorkoutPlan,
  WorkoutDay,
  Exercise,
  WorkoutSet,
  CompletedExercise,
  WorkoutLog,
  WorkoutHistoryItem,
  // Nutrition
  SavedMealPlan,
  // Achievements
  Achievement,
  UserAchievement,
  // Misc
  DailyQuest,
  FitnessGoal,
  GoalStatus,
  Team,
  TeamMember,
  UserWorkoutStats,
  CalendarEvent,
} from '../fitness.d.ts';

// Also, for types/interfaces only present in submodules, do default/explicit re-exports
export * from './profile';
export * from './workouts';
export * from './exercises';
export * from './analytics';
export * from './logs';
export * from './nutrition';
export * from './recommendations';
export * from './achievements';
export * from './challenges';
export * from './scheduling';

// Sync with 'SmartRecommendations' usage (add missing fields as needed)
export interface WorkoutRecommendation {
  id: string;
  workout_recommendations_user_id: string;
  title: string;
  name?: string;
  description: string;
  type?: string;
  reason?: string;
  confidence_score?: number;
  suggested_at?: string;
  created_at?: string;
  duration_minutes?: number;
  target_muscle_groups?: string[];
  recommended_frequency?: number;
  dismissed?: boolean;
  applied?: boolean;
  applied_at?: string;
  expires_at?: string;
  metadata?: any;
}
