
// Remove blanket export to break cyclic import/export chain.
// Instead, explicitly export just the types from the modular files you use across the app.

// Profile types
export * from './fitness.d.ts';

// Goals
export * from './fitness/goals';

// Recommendations
export * from './fitness/recommendations';

// Workouts
export * from './fitness/workouts';

// Analytics
export * from './fitness/analytics';

// Scheduling
export * from './fitness/scheduling';

// Schedules (for backwards compat)
export * from './fitness/schedules';

// Any other modular type files can be added here as needed.
