import { Exercise, WorkoutDay, CompletedExercise, ExerciseSet } from '@/types/fitness';

// Calculate total volume for an exercise (sets * reps * weight)
export const calculateExerciseVolume = (sets: number, reps: number, weight: number): number => {
  return sets * reps * weight;
};

// Calculate calories burned for a workout (rough estimate)
export const estimateCaloriesBurned = (durationMinutes: number, intensity: 'low' | 'medium' | 'high'): number => {
  const baseRate = {
    low: 3.5,
    medium: 6.0,
    high: 8.5
  };
  
  // Assuming average weight of 70kg
  const averageWeight = 70;
  return Math.round((baseRate[intensity] * averageWeight * durationMinutes) / 60);
};

// Check if workout day is completed
export const isWorkoutDayCompleted = (workoutDay: WorkoutDay): boolean => {
  if (!workoutDay.exercises || workoutDay.exercises.length === 0) {
    return false;
  }
  
  return workoutDay.exercises.every(exercise => {
    // For the purposes of this function, we'll check if exercise has basic completion info
    return exercise.name && exercise.sets > 0 && exercise.reps;
  });
};

// Calculate workout completion percentage
export const calculateWorkoutCompletion = (
  plannedExercises: Exercise[],
  completedExercises: CompletedExercise[]
): number => {
  if (plannedExercises.length === 0) return 0;
  
  const completedCount = completedExercises.length;
  return Math.round((completedCount / plannedExercises.length) * 100);
};

// Format rest time for display
export const formatRestTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
};

// Generate a workout summary
export const generateWorkoutSummary = (
  workoutDay: WorkoutDay,
  completedExercises: CompletedExercise[]
): {
  totalExercises: number;
  completedExercises: number;
  totalSets: number;
  completedSets: number;
  estimatedDuration: number;
} => {
  const totalExercises = workoutDay.exercises.length;
  const completedExercisesCount = completedExercises.length;
  
  const totalSets = workoutDay.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const completedSets = completedExercises.reduce((sum, exercise) => {
    return sum + (exercise.sets_completed?.length || 0);
  }, 0);
  
  // Estimate duration based on exercises and rest times
  const estimatedDuration = workoutDay.exercises.reduce((total, exercise) => {
    const exerciseTime = exercise.sets * 45; // 45 seconds per set average
    const restTime = (exercise.sets - 1) * (exercise.rest || 60); // Rest between sets
    return total + exerciseTime + restTime;
  }, 0);
  
  return {
    totalExercises,
    completedExercises: completedExercisesCount,
    totalSets,
    completedSets,
    estimatedDuration: Math.round(estimatedDuration / 60) // Convert to minutes
  };
};

// Create a default exercise template
export const createDefaultExercise = (name?: string): Exercise => {
  return {
    id: `exercise-${Date.now()}`,
    exercise_id: `exercise-${Date.now()}`,
    name: name || '',
    exercise_name: name || '',
    target_muscle: '',
    sets: 3,
    reps: '10-12',
    weight: 0,
    rest: 60,
    rest_time: 60,
    rest_seconds: 60,
    notes: ''
  };
};

// Validate workout plan
export const validateWorkoutPlan = (workoutDays: WorkoutDay[]): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (workoutDays.length === 0) {
    errors.push('At least one workout day is required');
  }
  
  workoutDays.forEach((day, dayIndex) => {
    if (!day.day_name.trim()) {
      errors.push(`Day ${dayIndex + 1} needs a name`);
    }
    
    if (day.exercises.length === 0) {
      errors.push(`Day ${dayIndex + 1} needs at least one exercise`);
    }
    
    day.exercises.forEach((exercise, exerciseIndex) => {
      if (!exercise.name.trim()) {
        errors.push(`Day ${dayIndex + 1}, Exercise ${exerciseIndex + 1} needs a name`);
      }
      
      if (!exercise.target_muscle.trim()) {
        errors.push(`Day ${dayIndex + 1}, Exercise ${exerciseIndex + 1} needs a target muscle`);
      }
      
      if (exercise.sets <= 0) {
        errors.push(`Day ${dayIndex + 1}, Exercise ${exerciseIndex + 1} needs valid sets`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get sets from completed exercise - handles different data structures
export const getSetsFromCompletedExercise = (exercise: CompletedExercise): any[] => {
  if (exercise.sets_completed && Array.isArray(exercise.sets_completed)) {
    return exercise.sets_completed.map((set, index) => ({
      reps: set.reps,
      weight: set.weight,
      rest_time: set.rest_time,
      duration: set.rest_time,
      notes: set.notes
    }));
  }
  
  // Fallback for legacy data structure
  if (exercise.reps_completed && exercise.weight_used) {
    return exercise.reps_completed.map((reps, index) => ({
      reps,
      weight: exercise.weight_used?.[index] || 0,
      rest_time: 60,
      duration: 60
    }));
  }
  
  return [];
};

// Convert completed exercises to exercise sets format
export const convertToExerciseSets = (completedExercises: CompletedExercise[], userId: string): ExerciseSet[] => {
  const exerciseSets: ExerciseSet[] = [];
  
  completedExercises.forEach(exercise => {
    exercise.sets_completed?.forEach((set, index) => {
      exerciseSets.push({
        id: `set-${Date.now()}-${index}`,
        user_id: userId,
        exercise_name: exercise.exercise_name,
        weight: set.weight,
        reps: typeof set.reps === 'string' ? parseInt(set.reps) : set.reps,
        rest_time: set.rest_time,
        notes: set.notes,
        created_at: new Date().toISOString()
      });
    });
  });
  
  return exerciseSets;
};
