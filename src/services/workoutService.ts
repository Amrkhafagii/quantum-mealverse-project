import { supabase } from '@/integrations/supabase/client';
import { 
  WorkoutPlan, 
  WorkoutDay, 
  Exercise, 
  WorkoutSchedule,
  WorkoutHistoryItem,
  UserWorkoutStats
} from '@/types/fitness';
import { Json } from '@/types/database';

/**
 * Get user's workout plans
 */
export const getUserWorkoutPlans = async (userId: string): Promise<{
  data: WorkoutPlan[] | null;
  error: any;
}> => {
  try {
    // Fetch workout plans
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    
    // Type casting required data
    const workoutPlans = data as any[] || [];
    
    // Fetch workout days for each plan
    const plansWithDays = await Promise.all(
      workoutPlans.map(async (plan) => {
        // Get workout days - needs to be handled differently as it's a JSON field
        // or separate table based on your schema
        const workoutDays = plan.workout_days || [];
        
        // For each day, get exercises
        const daysWithExercises = workoutDays.map((day: any) => {
          return {
            ...day,
            exercises: day.exercises || []
          };
        });
        
        return {
          ...plan,
          workout_days: daysWithExercises
        };
      })
    );

    return { data: plansWithDays as WorkoutPlan[], error: null };
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return { data: null, error };
  }
};

/**
 * Create a new workout plan
 */
export const createWorkoutPlan = async (
  userId: string,
  plan: Omit<WorkoutPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{
  data: WorkoutPlan | null;
  error: any;
}> => {
  try {
    const now = new Date().toISOString();
    
    // Create the new workout plan
    const newPlan = {
      id: crypto.randomUUID(),
      user_id: userId,
      name: plan.name,
      description: plan.description || '',
      goal: plan.goal,
      frequency: plan.frequency,
      difficulty: plan.difficulty,
      duration_weeks: plan.duration_weeks,
      created_at: now,
      updated_at: now,
      workout_days: JSON.stringify(plan.workout_days || [])
    };
    
    const { data, error } = await supabase
      .from('workout_plans')
      .insert(newPlan)
      .select()
      .single();
      
    if (error) throw error;
    
    // Transform back to expected format
    const createdPlan = {
      ...data,
      workout_days: JSON.parse(data.workout_days as string || '[]')
    };
    
    return { data: createdPlan as unknown as WorkoutPlan, error: null };
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing workout plan
 */
export const updateWorkoutPlan = async (
  planId: string,
  userId: string,
  updates: Partial<WorkoutPlan>
): Promise<{
  data: WorkoutPlan | null;
  error: any;
}> => {
  try {
    // Prepare updates object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Add other fields if they exist in updates
    if (updates.name) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.goal) updateData.goal = updates.goal;
    if (updates.frequency) updateData.frequency = updates.frequency;
    if (updates.difficulty) updateData.difficulty = updates.difficulty;
    if (updates.duration_weeks) updateData.duration_weeks = updates.duration_weeks;
    if (updates.workout_days) updateData.workout_days = JSON.stringify(updates.workout_days);
    
    const { data, error } = await supabase
      .from('workout_plans')
      .update(updateData)
      .eq('id', planId)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    // Transform back to expected format
    const updatedPlan = {
      ...data,
      workout_days: JSON.parse(data.workout_days as string || '[]')
    };
    
    return { data: updatedPlan as unknown as WorkoutPlan, error: null };
  } catch (error) {
    console.error('Error updating workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Delete a workout plan
 */
export const deleteWorkoutPlan = async (planId: string, userId: string): Promise<{
  success: boolean;
  error: any;
}> => {
  try {
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    return { success: false, error };
  }
};

/**
 * Get user's workout stats
 */
export const getUserWorkoutStats = async (userId: string): Promise<{
  data: UserWorkoutStats | null;
  error: any;
}> => {
  try {
    // Get user's streak and stats from the database
    const { data, error } = await supabase
      .from('user_workout_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    
    // If no stats exist yet, return default values
    if (!data) {
      const defaultStats: UserWorkoutStats = {
        streak: 0,
        total_workouts: 0,
        currentStreak: 0,
        most_active_day: 'N/A',
        achievements_count: 0,
        points: 0,
        level: 1
      };
      
      return { data: defaultStats, error: null };
    }
    
    // Convert stats from database format to our type
    const stats: UserWorkoutStats = {
      streak: data.streak || 0,
      total_workouts: data.total_workouts || 0,
      currentStreak: data.current_streak || 0,
      most_active_day: data.most_active_day || 'N/A',
      achievements_count: data.achievements_count || 0,
      points: data.points || 0,
      level: data.level || 1
    };
    
    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching user workout stats:', error);
    return { data: null, error };
  }
};

/**
 * Update user workout stats
 */
export const updateUserWorkoutStats = async (
  userId: string,
  stats: Partial<UserWorkoutStats>
): Promise<{
  success: boolean;
  error: any;
}> => {
  try {
    const updateData = {
      user_id: userId,
      streak: stats.streak,
      total_workouts: stats.total_workouts,
      current_streak: stats.currentStreak,
      most_active_day: stats.most_active_day,
      achievements_count: stats.achievements_count,
      points: stats.points,
      level: stats.level
    };
    
    const { error } = await supabase
      .from('user_workout_stats')
      .upsert(updateData)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating workout stats:', error);
    return { success: false, error };
  }
};
