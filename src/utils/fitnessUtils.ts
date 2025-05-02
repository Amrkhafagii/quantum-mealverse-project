
import { WorkoutPlan, WorkoutDay, Exercise, CompletedExercise, WorkoutSet } from '@/types/fitness';

/**
 * Normalizes exercise data to handle both old and new schema formats
 */
export function normalizeExercise(exercise: Exercise | WorkoutSet): Exercise {
  // Create a base exercise object with required fields
  const normalized: Partial<Exercise> = {
    id: 'id' in exercise ? exercise.id : ((exercise as any).exercise_id || crypto.randomUUID()),
    name: 'name' in exercise ? exercise.name : ((exercise as any).exercise_name || ''),
    target_muscle: 'target_muscle' in exercise ? (exercise as Exercise).target_muscle : 'unknown',
    sets: 'sets' in exercise ? (exercise as Exercise).sets : ((exercise as any).sets || 1),
    reps: 'reps' in exercise ? (exercise as Exercise).reps : (exercise as WorkoutSet).reps
  };
  
  // Add optional fields if they exist in either type
  if ('exercise_id' in exercise || (exercise as any).exercise_id) {
    normalized.exercise_id = (exercise as any).exercise_id;
  }
  
  if ('exercise_name' in exercise || (exercise as any).exercise_name) {
    normalized.exercise_name = (exercise as any).exercise_name;
  }
  
  if ('rest' in exercise) {
    normalized.rest = (exercise as Exercise).rest;
  }
  
  if ('rest_time' in exercise || (exercise as any).rest_time) {
    normalized.rest_time = (exercise as any).rest_time;
  }
  
  if ('duration' in exercise) {
    normalized.duration = exercise.duration;
  }
  
  if ('completed' in exercise) {
    normalized.completed = exercise.completed;
  }
  
  return normalized as Exercise;
}

/**
 * Normalizes workout day data to handle both old and new schema formats
 */
export function normalizeWorkoutDay(day: WorkoutDay): WorkoutDay {
  // Extend the WorkoutDay with name property for compatibility
  const extendedDay: WorkoutDay & { name?: string } = {
    ...day,
    day_name: day.day_name || (day as any).name || '',
  };
  
  // Handle the name property if it exists
  if ((day as any).name) {
    extendedDay.name = (day as any).name;
  }
  
  // Add order if it exists
  if ((day as any).order !== undefined) {
    (extendedDay as any).order = (day as any).order || 0;
  }
  
  // Normalize exercises
  extendedDay.exercises = Array.isArray(day.exercises) 
    ? day.exercises.map(normalizeExercise) 
    : [];
    
  return extendedDay;
}

/**
 * Normalizes workout plan data to handle both old and new schema formats
 */
export function normalizeWorkoutPlan(plan: WorkoutPlan): WorkoutPlan {
  return {
    ...plan,
    workout_days: Array.isArray(plan.workout_days) ? plan.workout_days.map(normalizeWorkoutDay) : []
  };
}

/**
 * Counts completed exercises in a workout log
 */
export function countCompletedExercises(completedExercises: CompletedExercise[]): number {
  return completedExercises.filter(ex => {
    if (Array.isArray(ex.sets_completed)) {
      return ex.sets_completed.length > 0;
    }
    return typeof ex.sets_completed === 'number' && ex.sets_completed > 0;
  }).length;
}

/**
 * Gets exercise by ID from a list of exercises
 */
export function getExerciseById(exercises: Exercise[], id: string): Exercise | undefined {
  return exercises.find(ex => ex.id === id || ex.exercise_id === id);
}

/**
 * Converts completed exercises to a format compatible with the API
 */
export function convertCompletedExercises(exercises: any[]): CompletedExercise[] {
  return exercises.map(ex => ({
    exercise_id: ex.exercise_id || ex.id,
    name: ex.name || ex.exercise_name,
    exercise_name: ex.exercise_name || ex.name,
    reps_completed: Array.isArray(ex.sets_completed) 
      ? ex.sets_completed.map((set: any) => set.reps) 
      : [],
    weight_used: Array.isArray(ex.sets_completed) 
      ? ex.sets_completed.map((set: any) => set.weight) 
      : [],
    sets_completed: ex.sets_completed,
    notes: ex.notes
  }));
}

/**
 * Converts between WorkoutSet and Exercise types
 */
export function convertWorkoutSetToExercise(set: any): Exercise {
  return {
    id: set.exercise_id || crypto.randomUUID(),
    exercise_id: set.exercise_id || crypto.randomUUID(),
    name: set.exercise_name || '',
    exercise_name: set.exercise_name || '',
    sets: set.sets || 1,
    reps: set.reps || 0,
    weight: set.weight || 0,
    duration: set.duration || 0,
    rest: set.rest_time || 0,
    rest_time: set.rest_time || 0,
    completed: set.completed || false,
    target_muscle: 'unknown' // Add required field
  };
}

/**
 * Converts between Exercise and WorkoutSet types
 */
export function convertExerciseToWorkoutSet(exercise: Exercise): WorkoutSet & { exercise_id?: string, exercise_name?: string } {
  return {
    exercise_id: exercise.exercise_id || exercise.id,
    exercise_name: exercise.exercise_name || exercise.name,
    set_number: 1, // Add required field
    reps: typeof exercise.reps === 'string' ? parseInt(exercise.reps, 10) || 0 : exercise.reps,
    weight: exercise.weight || 0,
    completed: exercise.completed || false
  };
}

/**
 * Safely handles the CompletedExercise sets_completed property
 */
export function getSetsFromCompletedExercise(exercise: CompletedExercise) {
  if (Array.isArray(exercise.sets_completed)) {
    return exercise.sets_completed;
  }
  
  // Create an array of sets from the numeric value
  const setCount = typeof exercise.sets_completed === 'number' ? exercise.sets_completed : 0;
  return Array(setCount).fill(0).map((_, i) => ({
    set_number: i + 1,
    weight: exercise.weight_used && exercise.weight_used[0] ? exercise.weight_used[0] : 0,
    reps: exercise.reps_completed && exercise.reps_completed[0] ? exercise.reps_completed[0] : 0
  }));
}
