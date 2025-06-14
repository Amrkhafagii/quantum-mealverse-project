
// DO NOT re-export types from other index.ts files to avoid infinite recursive instantiation.
// Only export "root" types directly from fitness.d.ts or single-level interfaces from modular files.

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

// Only export concrete non-type values or interfaces directly from files, not via wildcards or other index.ts files.
