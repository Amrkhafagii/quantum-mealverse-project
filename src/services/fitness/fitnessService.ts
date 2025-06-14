
import { supabase } from '@/integrations/supabase/client';
import { FitnessGoal, UserProfile, WorkoutLog, UserMeasurement } from '@/types/fitness';

// Note: The table 'user_profiles' is referenced in allowed tables.
// Use plain object shape/any for Supabase result typing throughout to avoid type recursion issues.

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_profiles_user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data as UserProfile || null;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

export const getFitnessGoals = async (userId: string): Promise<FitnessGoal[]> => {
  try {
    const { data, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('fitness_goals_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fitness goals:', error);
      return [];
    }

    return (data as FitnessGoal[]) || [];
  } catch (error) {
    console.error('Error in getFitnessGoals:', error);
    return [];
  }
};

export const createFitnessGoal = async (userId: string, goalData: Partial<FitnessGoal>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fitness_goals')
      .insert({
        fitness_goals_user_id: userId,
        ...goalData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating fitness goal:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createFitnessGoal:', error);
    return false;
  }
};

export const getWorkoutLogs = async (userId: string): Promise<WorkoutLog[]> => {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('workout_logs_user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching workout logs:', error);
      return [];
    }

    return (data as WorkoutLog[]) || [];
  } catch (error) {
    console.error('Error in getWorkoutLogs:', error);
    return [];
  }
};

export const getUserMeasurements = async (userId: string): Promise<UserMeasurement[]> => {
  try {
    const { data, error } = await supabase
      .from('user_measurements')
      .select('*')
      .eq('user_measurements_user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching user measurements:', error);
      return [];
    }

    return (data as UserMeasurement[]) || [];
  } catch (error) {
    console.error('Error in getUserMeasurements:', error);
    return [];
  }
};

