
import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan, WorkoutDay, WorkoutHistoryItem, WorkoutSchedule } from '@/types/fitness';
import { fromSupabaseJson, formatScheduleData } from './workoutUtils';

/**
 * Fetches workout plans for a user
 */
export const fetchWorkoutPlans = async (userId: string): Promise<WorkoutPlan[]> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Transform the data to ensure workout_days is properly typed
    return (data || []).map(plan => ({
      ...plan,
      workout_days: fromSupabaseJson(plan.workout_days) as WorkoutDay[]
    }));
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return [];
  }
};

/**
 * Fetches workout history for a user
 */
export const fetchWorkoutHistory = async (userId: string): Promise<WorkoutHistoryItem[]> => {
  try {
    // Query the workout_history table directly
    const { data: workoutHistory, error } = await supabase
      .from('workout_history')
      .select(`
        id, 
        user_id, 
        workout_log_id,
        date,
        workout_plan_name,
        workout_day_name,
        exercises_completed,
        total_exercises,
        duration,
        calories_burned
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      // Fallback to querying workout_logs directly if there's an error with the history table
      console.log('Falling back to querying workout_logs directly');
      const { data, error: logsError } = await supabase
        .from('workout_logs')
        .select(`
          id, 
          user_id, 
          workout_plan_id,
          date,
          duration,
          calories_burned,
          workout_plans:workout_plan_id (name)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (logsError) throw logsError;
      
      // Transform the data to match WorkoutHistoryItem
      return (data || []).map(log => ({
        id: log.id,
        user_id: log.user_id,
        workout_log_id: log.id,
        date: log.date,
        workout_plan_name: log.workout_plans?.name || 'Unknown Plan',
        workout_day_name: 'Unknown Day',
        exercises_completed: 0,
        total_exercises: 0,
        duration: log.duration,
        calories_burned: log.calories_burned || 0
      }));
    }

    return workoutHistory as WorkoutHistoryItem[];
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return [];
  }
};

/**
 * Fetches workout schedules for a user
 */
export const fetchWorkoutSchedules = async (userId: string): Promise<WorkoutSchedule[]> => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    
    // Convert the raw data to WorkoutSchedule format
    return (data || []).map(schedule => formatScheduleData(schedule));
  } catch (error) {
    console.error('Error fetching workout schedules:', error);
    return [];
  }
};
