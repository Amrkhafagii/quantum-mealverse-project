
import { format, isToday, isYesterday, addDays, parseISO, differenceInDays } from 'date-fns';
import { WorkoutHistoryItem, WorkoutLog, WorkoutPlan } from '@/types/fitness';

/**
 * Format a date string for display
 */
export const formatDisplayDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return 'Today';
    }
    
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    
    return format(date, 'MMM d, yyyy');
  } catch (e) {
    return dateString;
  }
};

/**
 * Calculate streak status from last activity date
 */
export const getStreakStatus = (lastActivityDate: string): { isActive: boolean; daysMissed: number } => {
  try {
    const lastDate = parseISO(lastActivityDate);
    const today = new Date();
    const yesterday = addDays(today, -1);
    
    // If last activity was today or yesterday, streak is active
    if (isToday(lastDate) || isYesterday(lastDate)) {
      return { isActive: true, daysMissed: 0 };
    }
    
    // Calculate days missed
    const daysMissed = differenceInDays(today, lastDate) - 1;
    return { isActive: false, daysMissed };
  } catch (e) {
    return { isActive: false, daysMissed: 0 };
  }
};

/**
 * Calculate completion percentage for a workout
 */
export const calculateWorkoutCompletion = (log: WorkoutLog, plan: WorkoutPlan): number => {
  if (!log.completed_exercises || !plan.workout_days) {
    return 0;
  }
  
  const completedExercises = log.completed_exercises.reduce((total, ex) => {
    return total + (ex.sets_completed?.length || 0);
  }, 0);
  
  // Find the corresponding workout day in the plan
  const planDay = plan.workout_days.find(day => {
    // Try to match based on exercises
    const logExerciseIds = log.completed_exercises.map(ex => ex.exercise_id);
    const dayExerciseIds = day.exercises.map(ex => ex.exercise_id);
    
    // If at least half of the exercise IDs match, consider it a match
    const matchingCount = logExerciseIds.filter(id => dayExerciseIds.includes(id)).length;
    return matchingCount >= Math.floor(dayExerciseIds.length / 2);
  });
  
  if (!planDay) {
    return 0;
  }
  
  // Calculate total sets in the plan day
  const totalSets = planDay.exercises.reduce((total, ex) => total + ex.sets, 0);
  
  if (totalSets === 0) {
    return 0;
  }
  
  return Math.round((completedExercises / totalSets) * 100);
};

/**
 * Convert workout data for database storage
 */
export const prepareWorkoutForStorage = (workout: any): any => {
  // Ensure the complex object is JSON-serializable
  return JSON.parse(JSON.stringify(workout));
};

/**
 * Summarize workout history items
 */
export const summarizeWorkoutHistory = (history: WorkoutHistoryItem[]): {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  workoutsByDay: Record<string, number>;
} => {
  const summary = {
    totalWorkouts: history.length,
    totalDuration: 0,
    totalCalories: 0,
    workoutsByDay: {} as Record<string, number>,
  };
  
  history.forEach(item => {
    summary.totalDuration += item.duration;
    summary.totalCalories += item.calories_burned || 0;
    
    // Group by day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = new Date(item.date).getDay();
    summary.workoutsByDay[dayOfWeek] = (summary.workoutsByDay[dayOfWeek] || 0) + 1;
  });
  
  return summary;
};
