
/**
 * Main fitness type entry point.
 *
 * Only re-export directly from fitness.d.ts and explicitly from each submodule,
 * to avoid circular type dependencies that cause deep type instantiation errors!
 * Do not re-export index from submodules, only explicit interface/type.
 */

export type {
  // Profile
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

// Additionally, re-export implementations for the modules that have
// type-implementations (not type-alias) in source, but DO NOT recursively
// re-export all from index files to prevent infinite recursion.

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

// For backward compatibility with components using "WorkoutRecommendation"
export interface WorkoutRecommendation {
  id: string;
  title: string;
  description: string;
  workout_recommendations_user_id?: string;
  name?: string;
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
