
import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan, WorkoutLog, WorkoutHistoryItem, UserWorkoutStats, WorkoutSchedule, WorkoutDay } from '@/types/fitness';
import { v4 as uuidv4 } from 'uuid';
import { Json } from '@/types/database';

/**
 * Gets all workout plans for a user
 */
export const getUserWorkoutPlans = async (userId: string): Promise<{ data: WorkoutPlan[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data) {
      // Convert to proper WorkoutPlan type
      const typedData: WorkoutPlan[] = data.map(plan => ({
        id: plan.id,
        user_id: plan.user_id,
        name: plan.name,
        description: plan.description || '',
        frequency: plan.frequency,
        goal: plan.goal,
        difficulty: plan.difficulty as 'beginner' | 'intermediate' | 'advanced',
        workout_days: Array.isArray(plan.workout_days) ? (plan.workout_days as unknown as WorkoutDay[]) : [],
        created_at: plan.created_at,
        updated_at: plan.updated_at,
        duration_weeks: plan.duration_weeks
      }));
      return { data: typedData, error: null };
    }
    
    return { data: null, error: null };
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return { data: null, error };
  }
};

/**
 * Gets a single workout plan by ID
 */
export const getWorkoutPlanById = async (planId: string): Promise<{ data: WorkoutPlan | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (error) throw error;
    
    // Convert to proper WorkoutPlan type
    const typedData: WorkoutPlan = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description || '',
      frequency: data.frequency,
      goal: data.goal,
      difficulty: data.difficulty as 'beginner' | 'intermediate' | 'advanced',
      workout_days: Array.isArray(data.workout_days) ? (data.workout_days as unknown as WorkoutDay[]) : [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      duration_weeks: data.duration_weeks
    };
    
    return { data: typedData, error: null };
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Creates a new workout plan
 */
export const createWorkoutPlan = async (plan: WorkoutPlan): Promise<{ data: WorkoutPlan | null, error: any }> => {
  try {
    // Convert WorkoutDay[] to Json for storage
    const workoutDaysJson = JSON.parse(JSON.stringify(plan.workout_days)) as Json;
    
    // Ensure duration_weeks is set with a default value for database requirement
    const planWithDefaults = {
      ...plan,
      workout_days: workoutDaysJson,
      duration_weeks: plan.duration_weeks || 4 // Default to 4 weeks if not provided
    };
    
    const { data, error } = await supabase
      .from('workout_plans')
      .insert(planWithDefaults)
      .select()
      .single();
      
    if (error) throw error;
    
    // Convert to proper WorkoutPlan type
    const typedData: WorkoutPlan = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description || '',
      frequency: data.frequency,
      goal: data.goal,
      difficulty: data.difficulty as 'beginner' | 'intermediate' | 'advanced',
      workout_days: Array.isArray(data.workout_days) ? (data.workout_days as unknown as WorkoutDay[]) : [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      duration_weeks: data.duration_weeks
    };
    
    return { data: typedData, error: null };
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Updates an existing workout plan
 */
export const updateWorkoutPlan = async (plan: WorkoutPlan): Promise<{ data: WorkoutPlan | null, error: any }> => {
  try {
    // Convert WorkoutDay[] to Json for storage
    const workoutDaysJson = JSON.parse(JSON.stringify(plan.workout_days)) as Json;
    
    // Create a new plan object with the JSON workout_days
    const planToUpdate = {
      ...plan,
      workout_days: workoutDaysJson
    };
    
    const { data, error } = await supabase
      .from('workout_plans')
      .update(planToUpdate)
      .eq('id', plan.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert to proper WorkoutPlan type
    const typedData: WorkoutPlan = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description || '',
      frequency: data.frequency,
      goal: data.goal,
      difficulty: data.difficulty as 'beginner' | 'intermediate' | 'advanced',
      workout_days: Array.isArray(data.workout_days) ? (data.workout_days as unknown as WorkoutDay[]) : [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      duration_weeks: data.duration_weeks
    };
    
    return { data: typedData, error: null };
  } catch (error) {
    console.error('Error updating workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Deletes a workout plan
 */
export const deleteWorkoutPlan = async (planId: string): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', planId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    return { success: false, error };
  }
};

/**
 * Logs a workout
 */
export const logWorkout = async (log: WorkoutLog): Promise<{ data: WorkoutLog | null, error: any }> => {
  try {
    // Convert completed_exercises to JSON
    const completedExercisesJson = JSON.parse(JSON.stringify(log.completed_exercises)) as Json;
    
    // If workout_plan_id is not provided, use a placeholder or null
    const logWithDefaults = {
      ...log,
      workout_plan_id: log.workout_plan_id || null, // Allow null for workout_plan_id
      completed_exercises: completedExercisesJson
    };
    
    const { data, error } = await supabase
      .from('workout_logs')
      .insert(logWithDefaults)
      .select()
      .single();
      
    if (error) throw error;
    
    // Convert back from Json to proper type
    const typedData: WorkoutLog = {
      ...data,
      completed_exercises: data.completed_exercises as unknown as any[]
    } as WorkoutLog;
    
    return { data: typedData, error: null };
  } catch (error) {
    console.error('Error logging workout:', error);
    return { data: null, error };
  }
};

/**
 * Gets all workout logs for a user
 */
export const getUserWorkoutLogs = async (userId: string): Promise<{ data: WorkoutLog[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Convert the JSON data to the proper WorkoutLog type
    const typedData: WorkoutLog[] = data?.map(item => ({
      ...item,
      completed_exercises: item.completed_exercises as unknown as any[]
    })) as WorkoutLog[];
    
    return { data: typedData, error: null };
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    return { data: null, error };
  }
};

/**
 * Gets all workout history items for a user
 */
export const getUserWorkoutHistory = async (userId: string): Promise<{ data: WorkoutHistoryItem[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as WorkoutHistoryItem[], error: null };
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return { data: null, error };
  }
};

/**
 * Gets workout statistics for a user
 */
export const getUserWorkoutStats = async (userId: string): Promise<{ data: UserWorkoutStats | null, error: any }> => {
  try {
    // Calculate basic stats from workout history
    const { data: historyData, error: historyError } = await supabase
      .from('workout_history')
      .select('*')
      .eq('user_id', userId);
    
    if (historyError) throw historyError;
    
    if (!historyData || historyData.length === 0) {
      // Return default stats if no history
      return { 
        data: {
          total_workouts: 0,
          totalWorkouts: 0,
          total_duration: 0,
          total_time: 0,
          total_calories: 0,
          streak: 0,
          most_active_day: '',
          favorite_exercise: '',
          weight_lifted: 0,
          completion_rate: 0,
          currentStreak: 0,
          longestStreak: 0
        }, 
        error: null 
      };
    }
    
    // Calculate total workouts, duration, calories
    let totalWorkouts = historyData.length;
    let totalDuration = historyData.reduce((sum, item) => sum + (item.duration || 0), 0);
    let totalCalories = historyData.reduce((sum, item) => sum + (item.calories_burned || 0), 0);
    
    // Get streak from user_streaks table
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', 'workout')
      .single();
    
    const currentStreak = streakData?.currentstreak || 0;
    const longestStreak = streakData?.longeststreak || 0;
    
    const stats: UserWorkoutStats = {
      total_workouts: totalWorkouts,
      totalWorkouts: totalWorkouts,
      total_duration: totalDuration,
      total_time: totalDuration,
      total_calories: totalCalories,
      streak: currentStreak,
      most_active_day: 'Monday', // This would require additional analysis
      favorite_exercise: 'Unknown', // This would require additional analysis
      weight_lifted: 0, // This would require additional analysis
      completion_rate: 0, // This would require additional analysis
      currentStreak: currentStreak,
      longestStreak: longestStreak
    };
    
    return { data: stats, error: null };
  } catch (error) {
    console.error('Error getting workout stats:', error);
    return { data: null, error };
  }
};

/**
 * Gets workout schedules for a user
 */
export const getUserWorkoutSchedules = async (userId: string): Promise<{ data: WorkoutSchedule[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);
    
    if (error) throw error;
    
    return { data: data as WorkoutSchedule[], error: null };
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
      .insert(schedule)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as WorkoutSchedule, error: null };
  } catch (error) {
    console.error('Error creating workout schedule:', error);
    return { data: null, error };
  }
};

// For backward compatibility
export const getWorkoutPlans = getUserWorkoutPlans;
export const getWorkoutHistory = getUserWorkoutHistory;
export const getWorkoutStats = getUserWorkoutStats;
export const saveWorkoutPlan = createWorkoutPlan;
export const getWorkoutSchedule = getUserWorkoutSchedules;
