
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
export const createWorkoutPlan = async (plans: WorkoutPlan[]): Promise<WorkoutPlan | null> => {
  try {
    // Convert workout plans to format that supabase expects
    const supabaseFormattedPlans = plans.map(plan => ({
      ...plan,
      workout_days: toSupabaseJson(plan.workout_days)
    }));

    const { data, error } = await supabase
      .from('workout_plans')
      .insert(supabaseFormattedPlans)
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

    // Convert workout days to JSON for DB storage
    const supabasePlan = {
      ...plan,
      workout_days: plan.workout_days ? toSupabaseJson(plan.workout_days) : undefined
    };

    const { data, error } = await supabase
      .from('workout_plans')
      .update(supabasePlan)
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
    const { data, error } = await supabase
      .from('workout_history_view')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
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
    return data || [];
  } catch (error) {
    console.error('Error fetching workout schedules:', error);
    return [];
  }
};

// Creates a new workout schedule
export const createWorkoutSchedule = async (schedule: WorkoutSchedule): Promise<WorkoutSchedule | null> => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .insert([schedule])
      .select()
      .single();

    if (error) throw error;
    return data;
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

    const { data, error } = await supabase
      .from('workout_schedules')
      .update(schedule)
      .eq('id', schedule.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating workout schedule:', error);
    return null;
  }
};
