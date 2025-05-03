
import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan, WorkoutDay, WorkoutSchedule } from '@/types/fitness';
import { toSupabaseJson, formatScheduleData } from './workoutUtils';

/**
 * Creates a new workout plan
 */
export const createWorkoutPlan = async (plan: WorkoutPlan): Promise<WorkoutPlan | null> => {
  try {
    // Convert workout plan to format that supabase expects
    const supabasePlan = {
      ...plan,
      workout_days: toSupabaseJson(plan.workout_days)
    };

    const { data, error } = await supabase
      .from('workout_plans')
      .insert(supabasePlan)
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
    console.error('Error creating workout plan:', error);
    return null;
  }
};

/**
 * Creates a new workout schedule
 */
export const createWorkoutSchedule = async (schedule: WorkoutSchedule): Promise<WorkoutSchedule | null> => {
  try {
    // Prepare data format that matches the database schema
    const dbSchedule = {
      user_id: schedule.user_id,
      workout_plan_id: schedule.workout_plan_id,
      day_of_week: schedule.day_of_week,
      days_of_week: Array.isArray(schedule.days_of_week) ? schedule.days_of_week : [],
      time: schedule.time,
      preferred_time: schedule.preferred_time,
      reminder: schedule.reminder,
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      active: schedule.active
    };

    const { data, error } = await supabase
      .from('workout_schedules')
      .insert([dbSchedule])
      .select()
      .single();

    if (error) throw error;
    
    // Convert the response to WorkoutSchedule type
    return formatScheduleData(data);
  } catch (error) {
    console.error('Error creating workout schedule:', error);
    return null;
  }
};
