
import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan, WorkoutSchedule } from '@/types/fitness';
import { toSupabaseJson, formatScheduleData } from './workoutUtils';

/**
 * Updates an existing workout plan
 */
export const updateWorkoutPlan = async (plan: Partial<WorkoutPlan>): Promise<WorkoutPlan | null> => {
  try {
    // Make sure we have an ID
    if (!plan.id) {
      throw new Error('Workout plan ID is required for updates');
    }

    // Fetch current plan to get values for required fields if not provided
    const { data: currentPlan, error: fetchError } = await supabase
      .from('workout_plans')
      .select('difficulty, frequency, duration_weeks, goal')
      .eq('id', plan.id)
      .single();

    if (fetchError) throw fetchError;

    // Ensure required fields are present for update
    const updatedPlan = {
      ...plan,
      // If these fields are not provided in the update, keep the original values
      difficulty: plan.difficulty || currentPlan.difficulty,
      frequency: plan.frequency || currentPlan.frequency,
      duration_weeks: plan.duration_weeks || currentPlan.duration_weeks,
      goal: plan.goal || currentPlan.goal,
      // Convert workout days to JSON for DB storage if present
      workout_days: plan.workout_days ? toSupabaseJson(plan.workout_days) : undefined
    };

    const { data, error } = await supabase
      .from('workout_plans')
      .update(updatedPlan)
      .eq('id', plan.id)
      .select()
      .single();

    if (error) throw error;

    // Transform back to our application format
    return {
      ...data,
      workout_days: Array.isArray(data.workout_days) 
        ? data.workout_days 
        : typeof data.workout_days === 'string' 
          ? JSON.parse(data.workout_days) 
          : []
    };
  } catch (error) {
    console.error('Error updating workout plan:', error);
    return null;
  }
};

/**
 * Updates an existing workout schedule
 */
export const updateWorkoutSchedule = async (schedule: Partial<WorkoutSchedule>): Promise<WorkoutSchedule | null> => {
  try {
    if (!schedule.id) {
      throw new Error('Schedule ID is required for updates');
    }
    
    // Prepare data for update
    const updateData: any = { ...schedule };
    
    // Ensure days_of_week is an array
    if (updateData.days_of_week && !Array.isArray(updateData.days_of_week)) {
      updateData.days_of_week = [];
    }

    const { data, error } = await supabase
      .from('workout_schedules')
      .update(updateData)
      .eq('id', schedule.id)
      .select()
      .single();

    if (error) throw error;
    
    // Convert the response to WorkoutSchedule type
    return formatScheduleData(data);
  } catch (error) {
    console.error('Error updating workout schedule:', error);
    return null;
  }
};
