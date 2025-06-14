
// Explicitly export all major fitness types from modular files for safer module usage.
// This fixes module import errors for re-used types everywhere in the codebase.
export * from './profile';
export * from './workouts';
export * from './exercises';
export * from './goals';
export * from './analytics';
export * from './logs';
export * from './nutrition';
export * from './schedules';
export * from './scheduling';
export * from './achievements';
export * from './challenges';
export * from './recommendations';

// DO NOT import from '../fitness.d.ts' to avoid recursion.
// Only export from modular files as above.
