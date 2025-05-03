
import { supabase } from '@/integrations/supabase/client';
import { WorkoutLog } from '@/types/fitness';
import { formatWorkoutLogForSupabase } from './workoutUtils';

/**
 * Creates a workout log entry
 */
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
