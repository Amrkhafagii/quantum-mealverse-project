
import { WorkoutPlan, WorkoutDay, Exercise, CompletedExercise, WorkoutSet } from '@/types/fitness';

/**
 * Normalizes exercise data to handle both old and new schema formats
 */
export function normalizeExercise(exercise: Exercise | WorkoutSet): Exercise {
  return {
    ...exercise,
    id: ('id' in exercise) ? exercise.id : exercise.exercise_id || crypto.randomUUID(),
    exercise_id: exercise.exercise_id || (('id' in exercise) ? exercise.id : crypto.randomUUID()),
    name: ('name' in exercise) ? exercise.name : exercise.exercise_name || '',
    exercise_name: exercise.exercise_name || (('name' in exercise) ? exercise.name : ''),
    rest: ('rest' in exercise) ? exercise.rest : exercise.rest_time || 0,
    rest_time: exercise.rest_time || (('rest' in exercise) ? exercise.rest : 0)
  } as Exercise;
}

/**
 * Normalizes workout day data to handle both old and new schema formats
 */
export function normalizeWorkoutDay(day: WorkoutDay): WorkoutDay {
  return {
    ...day,
    name: day.name || day.day_name || '',
    day_name: day.day_name || day.name || '',
    exercises: Array.isArray(day.exercises) ? day.exercises.map(normalizeExercise) : [],
    order: day.order || 0
  };
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
export function convertWorkoutSetToExercise(set: WorkoutSet): Exercise {
  return {
    id: set.exercise_id,
    exercise_id: set.exercise_id,
    name: set.exercise_name,
    exercise_name: set.exercise_name,
    sets: set.sets,
    reps: set.reps,
    weight: set.weight,
    duration: set.duration,
    rest: set.rest_time,
    rest_time: set.rest_time,
    completed: set.completed
  };
}

/**
 * Converts between Exercise and WorkoutSet types
 */
export function convertExerciseToWorkoutSet(exercise: Exercise): WorkoutSet {
  return {
    exercise_id: exercise.exercise_id || exercise.id,
    exercise_name: exercise.exercise_name || exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight,
    duration: exercise.duration,
    rest_time: exercise.rest_time || exercise.rest,
    completed: exercise.completed
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
