
import { supabase } from '@/integrations/supabase/client';
import { WorkoutLog } from '@/types/fitness';

/**
 * Log a completed workout and trigger achievement checking
 */
export const logWorkout = async (workoutLog: WorkoutLog): Promise<boolean> => {
  try {
    console.log('Logging workout:', workoutLog);
    
    // Insert the workout log using auth user_id (UUID)
    const { data: logData, error: logError } = await supabase
      .from('workout_logs')
      .insert([{
        user_id: workoutLog.user_id, // Already a UUID string from auth
        workout_plan_id: workoutLog.workout_plan_id,
        date: workoutLog.date || new Date().toISOString(),
        duration: workoutLog.duration,
        calories_burned: workoutLog.calories_burned,
        notes: workoutLog.notes,
        completed_exercises: JSON.stringify(workoutLog.completed_exercises)
      }])
      .select()
      .single();
      
    if (logError) {
      console.error('Error inserting workout log:', logError);
      throw logError;
    }
    
    console.log('Workout log inserted successfully:', logData);
    
    // Create a workout history entry for easier querying
    if (logData) {
      // Fetch the workout plan details to get the name
      const { data: planData, error: planError } = await supabase
        .from('workout_plans')
        .select('name')
        .eq('id', workoutLog.workout_plan_id)
        .single();
        
      if (planError) {
        console.error('Error fetching workout plan:', planError);
        // Don't throw here, we can still continue without the plan name
      }
      
      // Create history record using auth user_id (UUID)
      const { error: historyError } = await supabase
        .from('workout_history')
        .insert([{
          user_id: workoutLog.user_id, // Already a UUID string from auth
          workout_log_id: logData.id,
          date: workoutLog.date || new Date().toISOString(),
          workout_plan_name: planData?.name || 'Custom Workout',
          workout_day_name: 'Workout Session',
          duration: workoutLog.duration,
          exercises_completed: Array.isArray(workoutLog.completed_exercises) ? workoutLog.completed_exercises.length : 0,
          total_exercises: Array.isArray(workoutLog.completed_exercises) ? workoutLog.completed_exercises.length : 0,
          calories_burned: workoutLog.calories_burned
        }]);
        
      if (historyError) {
        console.error('Error creating workout history:', historyError);
        // Don't throw here, the main workout log was successful
      }
      
      console.log('Workout logged successfully, achievements will be automatically checked via trigger');
    }
    
    return true;
  } catch (error) {
    console.error('Error logging workout:', error);
    return false;
  }
};

/**
 * Get workout statistics for a user using auth UUID
 */
export const getWorkoutStats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_workout_stats')
      .select('*')
      .eq('user_workout_stats_user_id', userId) // Already a UUID string from auth
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      throw error;
    }
    
    return data || {
      total_workouts: 0,
      streak_days: 0,
      longest_streak: 0,
      total_calories_burned: 0,
      total_duration_minutes: 0,
      most_active_day: 'N/A'
    };
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    return {
      total_workouts: 0,
      streak_days: 0,
      longest_streak: 0,
      total_calories_burned: 0,
      total_duration_minutes: 0,
      most_active_day: 'N/A'
    };
  }
};
