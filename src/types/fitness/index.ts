// Import the types from the .d.ts file and explicitly export them as named exports.
// NOTE: The triple slash directive is ONLY for VSCode IntelliSense. In actual code, we need to redeclare them.

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
  WorkoutSchedule,
  Achievement,
  UserAchievement,
  UserWorkoutStats,
  SavedMealPlan,
  DailyQuest,
  FitnessGoal,
  GoalStatus,
  Team,
  TeamMember,
  CalendarEvent,
  SavedMealPlanWithExpiry,
} from './fitness.d';

// Fitness type exports for all modules and for direct component imports

export * from "./fitness.d"; // This covers all types from fitness.d.ts, including DailyQuest, SavedMealPlan, Team, TeamMember, CalendarEvent, etc.
