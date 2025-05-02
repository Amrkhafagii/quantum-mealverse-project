import { fromTable, supabase } from './supabaseClient';
import { FitnessGoal } from '@/types/fitness';

/**
 * Gets all fitness goals for a user
 */
export const getUserFitnessGoals = async (userId: string): Promise<{ data: FitnessGoal[] | null, error: any }> => {
  try {
    const { data, error } = await fromTable('fitness_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as FitnessGoal[], error: null };
  } catch (error) {
    console.error('Error fetching fitness goals:', error);
    return { data: null, error };
  }
};

/**
 * Adds a new fitness goal for a user
 */
export const addFitnessGoal = async (goal: FitnessGoal): Promise<{ data: FitnessGoal | null, error: any }> => {
  try {
    // Set created_at and updated_at
    const now = new Date().toISOString();
    const goalWithTimestamps = {
      ...goal,
      created_at: now,
      updated_at: now
    };
    
    const { data, error } = await fromTable('fitness_goals')
      .insert(goalWithTimestamps)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as FitnessGoal, error: null };
  } catch (error) {
    console.error('Error adding fitness goal:', error);
    return { data: null, error };
  }
};

/**
 * Updates an existing fitness goal
 */
export const updateFitnessGoal = async (goalData: FitnessGoal) => {
  try {
    // Ensure we're sending the correct data structure expected by the API
    // Make sure properties match the FitnessGoal interface
    
    const apiData = {
      id: goalData.id,
      user_id: goalData.user_id,
      name: goalData.name || goalData.title, // Use name or title
      description: goalData.description,
      status: goalData.status || 'active',
      target_date: goalData.target_date,
      target_weight: goalData.target_weight,
      target_body_fat: goalData.target_body_fat,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('fitness_goals')
      .update(apiData)
      .eq('id', goalData.id)
      .select();

    if (error) throw error;
    
    return { data: data?.[0] || null, error: null };
  } catch (error) {
    console.error('Error updating fitness goal:', error);
    return { data: null, error };
  }
};

/**
 * Deletes a fitness goal
 */
export const deleteFitnessGoal = async (goalId: string): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await fromTable('fitness_goals')
      .delete()
      .eq('id', goalId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting fitness goal:', error);
    return { success: false, error };
  }
};

/**
 * Updates a fitness goal's status
 */
export const updateGoalStatus = async (goalId: string, status: 'active' | 'completed' | 'abandoned'): Promise<{ data: FitnessGoal | null, error: any }> => {
  try {
    const { data, error } = await fromTable('fitness_goals')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as FitnessGoal, error: null };
  } catch (error) {
    console.error('Error updating goal status:', error);
    return { data: null, error };
  }
};

/**
 * Checks if a fitness goal has been achieved based on measurements
 * This can be called periodically to update goal statuses automatically
 */
export const checkGoalAchievement = async (userId: string): Promise<void> => {
  try {
    // Get active goals
    const { data: goals } = await fromTable('fitness_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
    
    if (!goals || goals.length === 0) return;
    
    // Get latest measurement
    const { data: latestMeasurement } = await fromTable('user_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (!latestMeasurement) return;
    
    // Check each goal
    for (const goal of goals) {
      // Check weight goal
      if (goal.target_weight !== null && latestMeasurement.weight !== null) {
        // If weight goal is achieved (weight is less than or equal to target)
        if (latestMeasurement.weight <= goal.target_weight) {
          await updateGoalStatus(goal.id, 'completed');
          
          // Notify the user about goal achievement through notification system
          await fromTable('notifications').insert({
            user_id: userId,
            type: 'goal_achievement',
            title: 'Goal Achieved!',
            message: `You've reached your weight goal of ${goal.target_weight}kg!`,
            read: false,
            created_at: new Date().toISOString()
          });
        }
      }
      
      // Check body fat goal
      if (goal.target_body_fat !== null && latestMeasurement.body_fat !== null) {
        if (latestMeasurement.body_fat <= goal.target_body_fat) {
          await updateGoalStatus(goal.id, 'completed');
          
          await fromTable('notifications').insert({
            user_id: userId,
            type: 'goal_achievement',
            title: 'Goal Achieved!',
            message: `You've reached your body fat goal of ${goal.target_body_fat}%!`,
            read: false,
            created_at: new Date().toISOString()
          });
        }
      }
      
      // Check if target date has passed for goals not achieved
      if (goal.target_date) {
        const targetDate = new Date(goal.target_date);
        const now = new Date();
        
        if (targetDate < now) {
          // Mark as abandoned if the target date has passed and goal wasn't achieved
          await updateGoalStatus(goal.id, 'abandoned');
          
          await fromTable('notifications').insert({
            user_id: userId,
            type: 'goal_reminder',
            title: 'Goal Timeframe Passed',
            message: `Your goal "${goal.name}" has passed its target date. You can update or reset it.`,
            read: false,
            created_at: new Date().toISOString()
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking goal achievement:', error);
  }
};
