
// Re-export all fitness types from their specific files
export * from './goals';
export * from './achievements';
export * from './challenges';
export * from './nutrition';
export * from './logs';
export * from './analytics';
export * from './recommendations';
export * from './scheduling';
export * from './profile';
export * from './exercises';

// Only export from workouts file, avoiding duplicates
export type {
  WorkoutPlan,
  WorkoutDay,
  Exercise,
  CompletedExercise,
  ExerciseSet,
  WorkoutSet,
  WorkoutSchedule,
  WorkoutHistoryItem,
  WorkoutRecommendation,
  UserWorkoutStats,
  WorkoutLog
} from './workouts';

// Additional types for UI components
export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'tracking' | 'workout' | 'nutrition' | 'activity';
  requirements: {
    action?: string;
    min_duration?: number;
    macro?: string;
    target?: number;
    steps?: number;
  };
  completed: boolean;
  deadline?: string;
}

// Additional types related to hydration tracking
export interface HydrationData {
  targetIntake: number;
  currentIntake: number;
  lastUpdated: string;
  glassSize: number;
}
