
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
  WorkoutRecommendation,
} from '../fitness.d.ts';

// Explicitly export only actual .ts type implementations (skip index re-exports!)
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
