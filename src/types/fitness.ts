
// Rebarrel all fitness types: named-export all major types from fitness.d.ts, then export modulars

// --- Named type exports for all common interfaces (so e.g. import { UserProfile } from '@/types/fitness' works) ---
export type {
  // Profiles
  UserProfile,
  UserMeasurement,
  // Workouts & exercise/group types
  WorkoutPlan,
  WorkoutDay,
  Exercise,
  WorkoutSet,
  CompletedExercise,
  WorkoutLog,
  WorkoutHistoryItem,
  WorkoutSchedule,
  // Achievements
  Achievement,
  UserAchievement,
  UserWorkoutStats,
  // Meal plans/nutrition
  SavedMealPlan,
  SavedMealPlanWithExpiry,
  DailyQuest,
  // Analytics/goals/teams/calendar
  FitnessGoal,
  GoalStatus,
  Team,
  TeamMember,
  CalendarEvent,
} from './fitness/index';

// --- Group / modular exports (export everything for compatibility) ---
export * from './fitness/goals';
export * from './fitness/workouts';
export * from './fitness/analytics';
export * from './fitness/scheduling';
export * from './fitness/schedules';
export * from './fitness/achievements';

// Add other modular types as needed...
