
import { supabase } from '@/integrations/supabase/client';
import { FitnessGoal, UserProfile, WorkoutLog, UserMeasurement } from '@/types/fitness';

// Local DB row types that map exactly to the Supabase columns
interface DBUserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  height?: number;
  weight: number;
  goal_weight?: number;
  date_of_birth?: string | null;
  gender?: string;
  fitness_level?: string;
  fitness_goals?: string[];
  dietary_preferences?: string[];
  dietary_restrictions?: string[];
  created_at?: string;
  updated_at?: string;
}

interface DBFitnessGoal {
  id: string;
  fitness_goals_user_id: string;
  name: string;
  description: string;
  target_weight?: number;
  target_body_fat?: number;
  target_date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface DBWorkoutLog {
  id?: string;
  workout_logs_user_id?: string;
  user_id?: string; // We map everything to user_id for the app
  workout_plan_id: string;
  date: string;
  duration: number;
  calories_burned?: number | null;
  notes?: string | null;
  completed_exercises: any[];
}

interface DBUserMeasurement {
  id: string;
  user_measurements_user_id?: string;
  user_id?: string;
  date: string;
  weight: number;
  body_fat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  legs?: number;
  notes?: string;
}

// --- Functions using local types and explicit mapping ---

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Return null for now since we don't have a user profiles table in the current schema
    console.log('getUserProfile called for userId:', userId);
    return null;
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

    if (!data) return [];

    // Cast and map to FitnessGoal[] with proper field mapping
    return (data as DBFitnessGoal[] || []).map(goal => ({
      id: goal.id,
      fitness_goals_user_id: goal.fitness_goals_user_id,
      name: goal.name,
      description: goal.description || '',
      target_value: goal.target_weight || goal.target_body_fat || 0,
      current_value: 0,
      target_date: goal.target_date,
      status: goal.status as any,
      goal_type: 'weight_loss',
      created_at: goal.created_at,
      updated_at: goal.updated_at
    }));
  } catch (error) {
    console.error('Error in getFitnessGoals:', error);
    return [];
  }
};

export const createFitnessGoal = async (
  userId: string,
  goalData: Partial<FitnessGoal>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fitness_goals')
      .insert({
        fitness_goals_user_id: userId,
        name: goalData.name || '',
        description: goalData.description || '',
        target_weight: goalData.target_value,
        target_date: goalData.target_date,
        status: goalData.status || 'not_started'
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

    if (!data) return [];

    // Map workout_logs_user_id to user_id
    return (data as DBWorkoutLog[]).map(log => ({
      ...log,
      user_id: log.user_id ?? log.workout_logs_user_id
    })) as WorkoutLog[];
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

    if (!data) return [];

    // Map user_measurements_user_id to user_id
    return (data as DBUserMeasurement[]).map(m => ({
      ...m,
      user_id: m.user_id ?? m.user_measurements_user_id
    })) as UserMeasurement[];
  } catch (error) {
    console.error('Error in getUserMeasurements:', error);
    return [];
  }
};

