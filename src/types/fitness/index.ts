
// Modular export of all fitness types (no legacy redefinition, strictly barrel)
export * from './analytics';
export * from './exercises';
export * from './profile';
export * from './recommendations';
export * from './scheduling';
export * from './workouts';
export * from './achievements';
export * from './nutrition';

// Only use the submodule exports above.
// Do NOT re-export types from '../fitness.d.ts' (causes deep infinite recursion issues).
