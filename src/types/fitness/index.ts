
// Re-export ONLY directly from fitness.d.ts (main source of truth).
// Avoid deep/recursive type re-exports to prevent infinite type instantiation
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

// Only export concrete non-type values from modular files, not additional types here.
