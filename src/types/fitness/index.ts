
// Modular export of all fitness types (no legacy redefinition, strictly barrel)
export * from './analytics';
export * from './exercises';
export * from './profile';
export * from './recommendations';
export * from './scheduling';
export * from './workouts';
export * from './achievements';
export * from './nutrition';

// Note: Do not re-define or duplicate interfaces here.
// All types should be imported from their native module. 
// This avoids type recursion/instantiation errors.

