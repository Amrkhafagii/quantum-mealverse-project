
// NOTE: Only export named top-level types from modular files here to avoid recursive instantiation and infinite depth errors.

export * from './workouts';
export * from './exercises';

// Direct export of types not imported from other index.ts
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

