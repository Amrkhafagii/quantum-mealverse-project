
// NOTE: Only export named top-level types from modular files here to avoid recursive instantiation and infinite depth errors.

export * from './workouts';
export * from './exercises';
// Explicitly avoid importing from '../fitness.d.ts' to prevent recursion. Only export from modular files.
