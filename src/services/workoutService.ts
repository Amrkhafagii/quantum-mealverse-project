import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan, WorkoutLog, WorkoutHistoryItem } from '@/types/fitness';
import { v4 as uuidv4 } from 'uuid';

/**
 * Gets all workout plans for a user
 */
export const getUserWorkoutPlans = async (userId: string): Promise<{ data: WorkoutPlan[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as WorkoutPlan[], error: null };
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return { data: null, error };
  }
};

/**
 * Gets a single workout plan by ID
 */
export const getWorkoutPlanById = async (planId: string): Promise<{ data: WorkoutPlan | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (error) throw error;
    
    return { data: data as WorkoutPlan, error: null };
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Creates a new workout plan
 */
export const createWorkoutPlan = async (plan: WorkoutPlan): Promise<{ data: WorkoutPlan | null, error: any }> => {
  try {
    // Ensure duration_weeks is set with a default value for database requirement
    const planWithDefaults = {
      ...plan,
      duration_weeks: plan.duration_weeks || 4 // Default to 4 weeks if not provided
    };
    
    const { data, error } = await supabase
      .from('workout_plans')
      .insert(planWithDefaults)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data: data as WorkoutPlan, error: null };
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Updates an existing workout plan
 */
export const updateWorkoutPlan = async (plan: WorkoutPlan): Promise<{ data: WorkoutPlan | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .update(plan)
      .eq('id', plan.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as WorkoutPlan, error: null };
  } catch (error) {
    console.error('Error updating workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Deletes a workout plan
 */
export const deleteWorkoutPlan = async (planId: string): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', planId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    return { success: false, error };
  }
};

/**
 * Logs a workout
 */
export const logWorkout = async (log: WorkoutLog): Promise<{ data: WorkoutLog | null, error: any }> => {
  try {
    // If workout_plan_id is not provided, use a placeholder or null
    const logWithDefaults = {
      ...log,
      workout_plan_id: log.workout_plan_id || null // Allow null for workout_plan_id
    };
    
    const { data, error } = await supabase
      .from('workout_logs')
      .insert(logWithDefaults)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data: data as WorkoutLog, error: null };
  } catch (error) {
    console.error('Error logging workout:', error);
    return { data: null, error };
  }
};

/**
 * Gets all workout logs for a user
 */
export const getUserWorkoutLogs = async (userId: string): Promise<{ data: WorkoutLog[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as WorkoutLog[], error: null };
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    return { data: null, error };
  }
};

/**
 * Gets a single workout log by ID
 */
export const getWorkoutLogById = async (logId: string): Promise<{ data: WorkoutLog | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('id', logId)
      .single();
    
    if (error) throw error;
    
    return { data: data as WorkoutLog, error: null };
  } catch (error) {
    console.error('Error fetching workout log:', error);
    return { data: null, error };
  }
};

/**
 * Deletes a workout log
 */
export const deleteWorkoutLog = async (logId: string): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await supabase
      .from('workout_logs')
      .delete()
      .eq('id', logId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting workout log:', error);
    return { success: false, error };
  }
};

/**
 * Creates a workout history item
 */
export const createWorkoutHistoryItem = async (item: WorkoutHistoryItem): Promise<{ data: WorkoutHistoryItem | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_history')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as WorkoutHistoryItem, error: null };
  } catch (error) {
    console.error('Error creating workout history item:', error);
    return { data: null, error };
  }
};

/**
 * Gets all workout history items for a user
 */
export const getUserWorkoutHistory = async (userId: string): Promise<{ data: WorkoutHistoryItem[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as WorkoutHistoryItem[], error: null };
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return { data: null, error };
  }
};
