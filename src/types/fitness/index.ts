
// Only re-export types directly and explicitly from the main .d.ts, to avoid duplicate or circular types!
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

// Only export actual type implementations, skip index re-exports to avoid recursive expansion!
// DO NOT re-export WorkoutRecommendation here; import from recommendations.ts or .d.ts directly if needed.
export * from './profile';
export * from './workouts';
export * from './exercises';
export * from './analytics';
export * from './logs';
export * from './nutrition';
export * from './achievements';
export * from './challenges';
export * from './scheduling';
// export * from './recommendations'; <-- DO NOT do this, direct import required for metadata-based fields.
