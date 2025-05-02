import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan, UserWorkoutStats } from '@/types/fitness';
import { toSupabaseJson } from '@/utils/supabaseUtils';

/**
 * Get all workout plans for a user
 */
export const getUserWorkoutPlans = async (userId: string): Promise<WorkoutPlan[]> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return [];
  }
};

/**
 * Create a new workout plan
 */
export const createWorkoutPlan = async (plan: WorkoutPlan): Promise<{ data: WorkoutPlan | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .insert([plan])
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing workout plan
 */
export const updateWorkoutPlan = async (planId: string, updates: Partial<WorkoutPlan>): Promise<{ data: WorkoutPlan | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Delete a workout plan
 */
export const deleteWorkoutPlan = async (planId: string): Promise<{ success: boolean; error: any }> => {
  try {
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', planId);
      
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    return { success: false, error };
  }
};

/**
 * Get workout history for a user
 */
export const getUserWorkoutHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return [];
  }
};

/**
 * Log a completed workout
 */
export const logWorkout = async (workoutLog: any) => {
  try {
    const formattedLog = {
      ...workoutLog,
      completed_exercises: toSupabaseJson(workoutLog.completed_exercises)
    };
    
    const { data, error } = await supabase
      .from('workout_logs')
      .insert(formattedLog);
      
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error logging workout:', error);
    return { success: false, error };
  }
};

/**
 * Get workout schedules for a user
 */
export const getUserWorkoutSchedules = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching workout schedules:', error);
    return [];
  }
};

/**
 * Create a workout schedule for a user
 */
export const createWorkoutSchedule = async (scheduleData: any) => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .insert(scheduleData);
      
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error creating workout schedule:', error);
    return { success: false, error };
  }
};

// Fix the getUserWorkoutStats function to properly handle the user_workout_stats table
export const getUserWorkoutStats = async (userId: string): Promise<UserWorkoutStats | null> => {
  try {
    // Use the from method directly with a string for tables not in the TypeScript schema
    const { data, error } = await supabase
      .rpc('get_user_workout_stats', { user_id_param: userId });
    
    if (error) {
      console.error('Error fetching workout stats:', error);
      return null;
    }
    
    // If no data, return default stats
    if (!data) {
      return {
        streak: 0,
        total_workouts: 0,
        current_streak: 0,
        most_active_day: 'N/A',
        achievements_count: 0
      };
    }
    
    return {
      streak: data.streak || 0,
      total_workouts: data.total_workouts || 0,
      current_streak: data.current_streak || 0,
      most_active_day: data.most_active_day || 'N/A',
      achievements_count: data.achievements_count || 0
    };
  } catch (error) {
    console.error('Error in getUserWorkoutStats:', error);
    return null;
  }
};

// Alias for getWorkoutPlans for backward compatibility
export const getWorkoutPlans = getUserWorkoutPlans;
