
// Explicitly export all fitness types needed in components.

export * from './profile';            // UserProfile, UserMeasurement, DailyQuest, SavedMealPlan, Team, TeamMember
export * from './workouts';           // WorkoutPlan, WorkoutDay, WorkoutLog, UserWorkoutStats
export * from './exercises';          // Exercise, WorkoutTemplate, etc.
export * from './goals';              // FitnessGoal, GoalStatus
export * from './analytics';          // Analytics types (if any)
export * from './logs';               // Log types (if any)
export * from './nutrition';          // Nutrition types (if any)
export * from './schedules';          // CalendarEvent, etc.
export * from './scheduling';
export * from './achievements';       // Achievement, UserAchievement, etc.
export * from './challenges';         // Challenge, Team, TeamMember, etc.
export * from './recommendations';    // Recommendation, etc.

// DO NOT import/re-export from '../fitness.d.ts' (avoids recursion).
