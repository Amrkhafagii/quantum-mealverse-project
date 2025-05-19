
import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan, WorkoutSchedule, WorkoutHistoryItem } from '@/types/fitness';
import { formatScheduleData } from './workoutUtils';

/**
 * Fetches all workout plans for a user
 */
export const fetchWorkoutPlans = async (userId: string): Promise<WorkoutPlan[]> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Transform workout_days from JSON string to array if needed
    return data.map(plan => ({
      ...plan,
      workout_days: typeof plan.workout_days === 'string' 
        ? JSON.parse(plan.workout_days) 
        : plan.workout_days
    }));
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return [];
  }
};

/**
 * Fetches all workout schedules for a user
 */
export const fetchWorkoutSchedules = async (userId: string): Promise<WorkoutSchedule[]> => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Format the data to match our WorkoutSchedule type
    return data.map(schedule => formatScheduleData(schedule));
  } catch (error) {
    console.error('Error fetching workout schedules:', error);
    return [];
  }
};

/**
 * Fetches workout history for a user
 */
export const fetchWorkoutHistory = async (userId: string): Promise<WorkoutHistoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('workout_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return [];
  }
};
