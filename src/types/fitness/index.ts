
// Re-export all fitness types from their specific files
export * from './goals';
export * from './achievements';
export * from './challenges';
export * from './nutrition';
export * from './workouts';
export * from './logs';
export * from './analytics';
export * from './recommendations';

// Export scheduling types (remove duplicate WorkoutSchedule export)
export * from './scheduling';

// Additional types related to hydration tracking
export interface HydrationData {
  targetIntake: number;
  currentIntake: number;
  lastUpdated: string;
  glassSize: number;
}
