import { supabase } from '@/integrations/supabase/client';
import { 
  WorkoutPlan, WorkoutDay, WorkoutLog, WorkoutSchedule, WorkoutHistoryItem
} from '@/types/fitness';
import { toSupabaseJson, fromSupabaseJson, formatWorkoutLogForSupabase } from '@/utils/supabaseUtils';
import { Json } from '@/types/database';

// Fetches workout plans for a user
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

// Creates a new workout plan
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
      workout_days: fromSupabaseJson(data.workout_days) as WorkoutDay[]
    };
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return null;
  }
};

// Updates an existing workout plan
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
      workout_days: fromSupabaseJson(data.workout_days) as WorkoutDay[]
    };
  } catch (error) {
    console.error('Error updating workout plan:', error);
    return null;
  }
};

// Creates a workout log entry
export const logWorkout = async (workoutLog: WorkoutLog): Promise<boolean> => {
  try {
    // Format workout log for Supabase
    const formattedLog = formatWorkoutLogForSupabase(workoutLog);

    const { error } = await supabase
      .from('workout_logs')
      .insert([formattedLog]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging workout:', error);
    return false;
  }
};

// Fetches workout history for a user
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

// Fetches workout schedules for a user
export const fetchWorkoutSchedules = async (userId: string): Promise<WorkoutSchedule[]> => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    
    // Convert the raw data to WorkoutSchedule format
    const schedules: WorkoutSchedule[] = (data || []).map(schedule => ({
      id: schedule.id,
      user_id: schedule.user_id,
      workout_plan_id: schedule.workout_plan_id,
      day_of_week: schedule.day_of_week || '',
      days_of_week: Array.isArray(schedule.days_of_week) ? schedule.days_of_week as number[] : [],
      time: schedule.time || schedule.preferred_time || '',
      preferred_time: schedule.preferred_time,
      reminder: schedule.reminder || false,
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      active: schedule.active || false,
      created_at: schedule.created_at,
      updated_at: schedule.updated_at
    }));
    
    return schedules;
  } catch (error) {
    console.error('Error fetching workout schedules:', error);
    return [];
  }
};

// Creates a new workout schedule
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
    return {
      id: data.id,
      user_id: data.user_id,
      workout_plan_id: data.workout_plan_id,
      day_of_week: data.day_of_week || '',
      days_of_week: Array.isArray(data.days_of_week) ? data.days_of_week : [],
      time: data.time || data.preferred_time || '',
      preferred_time: data.preferred_time,
      reminder: data.reminder || false,
      start_date: data.start_date,
      end_date: data.end_date,
      active: data.active,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error creating workout schedule:', error);
    return null;
  }
};

// Updates an existing workout schedule
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
    return {
      id: data.id,
      user_id: data.user_id,
      workout_plan_id: data.workout_plan_id,
      day_of_week: data.day_of_week || '',
      days_of_week: Array.isArray(data.days_of_week) ? data.days_of_week : [],
      time: data.time || data.preferred_time || '',
      preferred_time: data.preferred_time,
      reminder: data.reminder || false,
      start_date: data.start_date,
      end_date: data.end_date,
      active: data.active,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error updating workout schedule:', error);
    return null;
  }
};
