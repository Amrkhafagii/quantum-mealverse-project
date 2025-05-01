
import { supabase } from '@/integrations/supabase/client';
import { 
  WorkoutPlan, 
  WorkoutLog, 
  WorkoutHistoryItem, 
  UserWorkoutStats, 
  WorkoutSchedule 
} from '@/types/fitness';

/**
 * Saves a workout plan to the database
 */
export const saveWorkoutPlan = async (plan: WorkoutPlan): Promise<{ data: WorkoutPlan | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .insert([plan])
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error saving workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Gets all workout plans for a user
 */
export const getWorkoutPlans = async (userId: string): Promise<{ data: WorkoutPlan[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return { data: null, error };
  }
};

/**
 * Logs a completed workout
 */
export const logWorkout = async (workoutLog: WorkoutLog): Promise<{ data: WorkoutLog | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .insert([workoutLog])
      .select()
      .single();
    
    // After logging the workout, update workout history
    if (!error) {
      await updateWorkoutHistory(workoutLog);
      await updateUserStreak(workoutLog.user_id);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error logging workout:', error);
    return { data: null, error };
  }
};

/**
 * Updates the workout history table
 */
const updateWorkoutHistory = async (workoutLog: WorkoutLog): Promise<void> => {
  try {
    // Get the workout plan to get the name
    const { data: planData } = await supabase
      .from('workout_plans')
      .select('name')
      .eq('id', workoutLog.workout_plan_id)
      .single();

    if (!planData) return;

    const historyItem: Partial<WorkoutHistoryItem> = {
      user_id: workoutLog.user_id,
      date: workoutLog.date,
      workout_log_id: workoutLog.id,
      workout_plan_name: planData.name,
      workout_day_name: 'Completed Workout', // This could be enhanced with actual day name
      duration: workoutLog.duration,
      exercises_completed: workoutLog.completed_exercises.length,
      total_exercises: workoutLog.completed_exercises.length, // In a real app, compare with planned
      calories_burned: workoutLog.calories_burned
    };

    await supabase
      .from('workout_history')
      .insert([historyItem]);
      
  } catch (error) {
    console.error('Error updating workout history:', error);
  }
};

/**
 * Updates user's workout streak
 */
const updateUserStreak = async (userId: string): Promise<void> => {
  try {
    // Get the current date
    const today = new Date().toISOString().split('T')[0];
    
    // Get current streak
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', 'workout')
      .single();
    
    let currentStreak = 0;
    let longestStreak = 0;
    
    if (streakData) {
      const lastActivityDate = new Date(streakData.last_activity_date);
      const currentDate = new Date();
      const diffTime = currentDate.getTime() - lastActivityDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If the last activity was yesterday or today, increment streak
      if (diffDays <= 1) {
        currentStreak = streakData.currentStreak + 1;
      } else {
        // Streak broken
        currentStreak = 1;
      }
      
      // Update longest streak if current is greater
      longestStreak = Math.max(currentStreak, streakData.longestStreak);
      
      // Update streak
      await supabase
        .from('user_streaks')
        .update({
          currentStreak,
          longestStreak,
          last_activity_date: today
        })
        .eq('id', streakData.id);
    } else {
      // Create new streak record
      await supabase
        .from('user_streaks')
        .insert([{
          user_id: userId,
          currentStreak: 1,
          longestStreak: 1,
          last_activity_date: today,
          streak_type: 'workout'
        }]);
    }
  } catch (error) {
    console.error('Error updating user streak:', error);
  }
};

/**
 * Gets workout history for a user
 */
export const getWorkoutHistory = async (userId: string, dateFilter?: string): Promise<{ data: WorkoutHistoryItem[] | null, error: any }> => {
  try {
    let query = supabase
      .from('workout_history')
      .select(`
        *,
        workout_logs (*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    // Apply date filter if provided
    if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query = query.gte('date', oneWeekAgo.toISOString());
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      query = query.gte('date', oneMonthAgo.toISOString());
    } else if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('date', today);
    }
    
    const { data, error } = await query;
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return { data: null, error };
  }
};

/**
 * Gets workout statistics for a user
 */
export const getWorkoutStats = async (userId: string): Promise<{ data: UserWorkoutStats | null, error: any }> => {
  try {
    // Get workout history
    const { data: historyData } = await getWorkoutHistory(userId);
    
    if (!historyData || historyData.length === 0) {
      return { 
        data: {
          user_id: userId,
          totalWorkouts: 0,
          total_time: 0,
          total_calories: 0,
          favorite_exercise: 'None',
          strongest_exercise: {
            exercise_id: '',
            exercise_name: 'None',
            max_weight: 0
          },
          most_improved_exercise: {
            exercise_id: '',
            exercise_name: 'None',
            improvement_percentage: 0
          },
          currentStreak: 0,
          longestStreak: 0,
          weekly_goal_completion: 0
        }, 
        error: null 
      };
    }
    
    // Get streak data
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', 'workout')
      .single();
    
    // Calculate stats
    const totalWorkouts = historyData.length;
    const totalTime = historyData.reduce((sum, item) => sum + (item.duration || 0), 0);
    const totalCalories = historyData.reduce((sum, item) => sum + (item.calories_burned || 0), 0);
    
    // For favorite and strongest exercise, we'd need to analyze workout logs
    // This is a simplified implementation
    const favoriteExercise = 'Bench Press'; // Would calculate from actual data
    
    const stats: UserWorkoutStats = {
      user_id: userId,
      totalWorkouts,
      total_time: totalTime,
      total_calories: totalCalories,
      favorite_exercise: favoriteExercise,
      strongest_exercise: {
        exercise_id: 'ex1',
        exercise_name: 'Bench Press',
        max_weight: 225
      },
      most_improved_exercise: {
        exercise_id: 'ex1',
        exercise_name: 'Bench Press',
        improvement_percentage: 15
      },
      currentStreak: streakData?.currentStreak || 0,
      longestStreak: streakData?.longestStreak || 0,
      weekly_goal_completion: 0 // Would calculate based on scheduled workouts
    };
    
    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    return { data: null, error };
  }
};

/**
 * Gets workout schedule for a user
 */
export const getWorkoutSchedule = async (userId: string): Promise<{ data: WorkoutSchedule[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching workout schedules:', error);
    return { data: null, error };
  }
};

/**
 * Creates a workout schedule
 */
export const createWorkoutSchedule = async (schedule: WorkoutSchedule): Promise<{ data: WorkoutSchedule | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .insert([schedule])
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error creating workout schedule:', error);
    return { data: null, error };
  }
};
