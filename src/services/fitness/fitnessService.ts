
// Refactored: Use local interfaces and explicit mapping to avoid "Type instantiation is excessively deep" error.
import { supabase } from '@/integrations/supabase/client';
import { FitnessGoal, UserProfile, WorkoutLog, UserMeasurement } from '@/types/fitness';

// Minimal interface definitions matching DB fields for Supabase mapping
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
  user_id?: string;
  name: string;
  description?: string;
  target_value: number;
  current_value: number;
  target_date: string;
  status: string;
  goal_type: string;
  created_at?: string;
  updated_at?: string;
  title?: string;
  target_weight?: number;
  target_body_fat?: number;
  category?: string;
  type?: string;
  start_date?: string;
  is_active?: boolean;
}

interface DBWorkoutLog {
  id?: string;
  user_id: string;
  workout_plan_id: string;
  date: string;
  duration: number;
  calories_burned?: number | null;
  notes?: string | null;
  completed_exercises: any[];
}

interface DBUserMeasurement {
  id: string;
  user_id: string;
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

// Get user profile for given userId
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Return null only if not found or any real error
      if (error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      }
      return null;
    }
    // Map to app type
    const profile: UserProfile = {
      ...data as DBUserProfile
    };
    return profile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

// Get fitness goals for the given userId
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

    // Cast and map to FitnessGoal[]
    return (data as DBFitnessGoal[] || []).map((goal) => ({ ...goal }));
  } catch (error) {
    console.error('Error in getFitnessGoals:', error);
    return [];
  }
};

// Create a new fitness goal
export const createFitnessGoal = async (
  userId: string,
  goalData: Partial<FitnessGoal>
): Promise<boolean> => {
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

// Get workout logs for the given userId
export const getWorkoutLogs = async (userId: string): Promise<WorkoutLog[]> => {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching workout logs:', error);
      return [];
    }

    return (data as DBWorkoutLog[] || []).map((log) => ({ ...log }));
  } catch (error) {
    console.error('Error in getWorkoutLogs:', error);
    return [];
  }
};

// Get user measurements for the given userId
export const getUserMeasurements = async (userId: string): Promise<UserMeasurement[]> => {
  try {
    const { data, error } = await supabase
      .from('user_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching user measurements:', error);
      return [];
    }

    return (data as DBUserMeasurement[] || []).map((m) => ({ ...m }));
  } catch (error) {
    console.error('Error in getUserMeasurements:', error);
    return [];
  }
};

