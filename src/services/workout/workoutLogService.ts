
import { supabase } from '@/integrations/supabase/client';
import { WorkoutLog } from '@/types/fitness';

/**
 * Log a completed workout
 */
export const logWorkout = async (workoutLog: WorkoutLog): Promise<boolean> => {
  try {
    // Insert the workout log
    const { data: logData, error: logError } = await supabase
      .from('workout_logs')
      .insert([{
        user_id: workoutLog.user_id,
        workout_plan_id: workoutLog.workout_plan_id,
        date: workoutLog.date || new Date().toISOString(),
        duration: workoutLog.duration,
        calories_burned: workoutLog.calories_burned,
        notes: workoutLog.notes,
        completed_exercises: JSON.stringify(workoutLog.completed_exercises)
      }])
      .select()
      .single();
      
    if (logError) throw logError;
    
    // Create a workout history entry for easier querying
    if (logData) {
      // Fetch the workout plan details to get the name
      const { data: planData, error: planError } = await supabase
        .from('workout_plans')
        .select('name')
        .eq('id', workoutLog.workout_plan_id)
        .single();
        
      if (planError) throw planError;
      
      // Create history record
      const { error: historyError } = await supabase
        .from('workout_history')
        .insert([{
          user_id: workoutLog.user_id,
          workout_log_id: logData.id,
          date: workoutLog.date || new Date().toISOString(),
          workout_plan_name: planData?.name || 'Unknown Plan',
          workout_day_name: 'Workout Session', // Default if not provided
          duration: workoutLog.duration,
          exercises_completed: Array.isArray(workoutLog.completed_exercises) ? workoutLog.completed_exercises.length : 0,
          total_exercises: Array.isArray(workoutLog.completed_exercises) ? workoutLog.completed_exercises.length : 0,
          calories_burned: workoutLog.calories_burned
        }]);
        
      if (historyError) throw historyError;
      
      // Update user streak
      await updateUserStreak(workoutLog.user_id);
    }
    
    return true;
  } catch (error) {
    console.error('Error logging workout:', error);
    return false;
  }
};

/**
 * Update the user's workout streak
 */
const updateUserStreak = async (userId: string): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get current streak info
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', 'workout')
      .single();
      
    if (streakError && streakError.code !== 'PGRST116') {
      throw streakError;
    }
    
    if (!streakData) {
      // First time, create a new streak
      await supabase
        .from('user_streaks')
        .insert([{
          user_id: userId,
          currentstreak: 1,
          longeststreak: 1,
          last_activity_date: today,
          streak_type: 'workout'
        }]);
    } else {
      const lastDate = new Date(streakData.last_activity_date);
      const currentDate = new Date(today);
      
      // Calculate difference in days
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      let newStreak = streakData.currentstreak;
      
      if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      } else {
        // Same day, no change
        return;
      }
      
      // Update the streak
      await supabase
        .from('user_streaks')
        .update({
          currentstreak: newStreak,
          longeststreak: Math.max(newStreak, streakData.longeststreak),
          last_activity_date: today
        })
        .eq('id', streakData.id);
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
};
