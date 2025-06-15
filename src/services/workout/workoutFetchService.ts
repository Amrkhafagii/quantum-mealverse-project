
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
      .eq('workout_plans_user_id', userId); // <-- Updated to new convention
      
    if (error) throw error;
    
    // Transform workout_days from JSON string to array if needed and ensure proper typing
    return data.map(plan => ({
      ...plan,
      user_id: plan.workout_plans_user_id, // Map database field to expected field
      difficulty: (plan.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
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
      .eq('workout_schedules_user_id', userId); // <-- Updated to new convention
      
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
      .eq('workout_history_user_id', userId) // <-- Updated to new convention
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    // Map database fields to WorkoutHistoryItem type
    return data.map(item => ({
      ...item,
      user_id: item.workout_history_user_id, // Map database field to expected field
      // Provide fallback values for optional fields
      workout_plan_id: item.workout_log_id || '',
      completed_exercises: []
    }));
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return [];
  }
};
