
// Re-export ONLY directly from fitness.d.ts (main source of truth).
export type {
  UserProfile,
  UserMeasurement,
  WorkoutPlan,
  WorkoutDay,
  Exercise,
  WorkoutSet,
  CompletedExercise,
  WorkoutLog,
  WorkoutHistoryItem,
  SavedMealPlan,
  Achievement,
  UserAchievement,
  DailyQuest,
  FitnessGoal,
  GoalStatus,
  Team,
  TeamMember,
  UserWorkoutStats,
  CalendarEvent,
} from '../fitness.d.ts';

// Export only type implementations (NOT types, just values) from modular files.
export * from './profile';      // Contains interfaces, not re-exports.
export * from './workouts';
export * from './exercises';
export * from './analytics';
export * from './logs';
export * from './nutrition';
export * from './achievements';
export * from './challenges';
export * from './scheduling';
// Do NOT re-export recommendations here; import from recommendations.ts or .d.ts directly if needed.
