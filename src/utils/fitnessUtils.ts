
import { WorkoutPlan, WorkoutDay, Exercise, CompletedExercise } from '@/types/fitness';

/**
 * Normalizes exercise data to handle both old and new schema formats
 */
export function normalizeExercise(exercise: Exercise): Exercise {
  return {
    ...exercise,
    id: exercise.id || exercise.exercise_id || crypto.randomUUID(),
    name: exercise.name || exercise.exercise_name || '',
    rest: exercise.rest || exercise.rest_time || 0
  };
}

/**
 * Normalizes workout day data to handle both old and new schema formats
 */
export function normalizeWorkoutDay(day: WorkoutDay): WorkoutDay {
  return {
    ...day,
    name: day.name || day.day_name || '',
    day_name: day.day_name || day.name || '',
    exercises: day.exercises?.map(normalizeExercise) || []
  };
}

/**
 * Normalizes workout plan data to handle both old and new schema formats
 */
export function normalizeWorkoutPlan(plan: WorkoutPlan): WorkoutPlan {
  return {
    ...plan,
    workout_days: plan.workout_days?.map(normalizeWorkoutDay) || []
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
    return ex.sets_completed > 0;
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
    exercise_id: ex.exercise_id,
    name: ex.exercise_name || ex.name,
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
