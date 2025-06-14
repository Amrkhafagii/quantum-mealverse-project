
// Modular export of all fitness types (no legacy redefinition, strictly barrel)
export * from './analytics';
export * from './exercises';
export * from './profile';
export * from './recommendations';
export * from './scheduling';
export * from './workouts';
export * from './achievements';
export * from './nutrition';

// Direct type exports for types used across various modules:
export type {
  // Core data types
  SavedMealPlan,
  SavedMealPlanWithExpiry,
  WorkoutPlan,
  WorkoutDay,
  WorkoutLog,
  WorkoutHistoryItem,
  WorkoutSet,
  Exercise,
  CompletedExercise,
  UserMeasurement,
  UserProfile,
  WorkoutSchedule,
  Achievement,
  UserAchievement,
  UserWorkoutStats,
  // Achievements
  Team,
  TeamMember,
  // Recommendations + Quests + Goals
  WorkoutRecommendation,
  DailyQuest,
  FitnessGoal,
  GoalStatus,
  // Scheduling/calendar types
  CalendarEvent
} from '../fitness.d.ts';

