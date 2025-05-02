import { supabase } from '@/integrations/supabase/client';
import { FitnessGoal } from '@/types/fitness';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all fitness goals for a user
 */
export const getUserFitnessGoals = async (userId: string): Promise<{
  data: FitnessGoal[] | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<FitnessGoal[]>();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching fitness goals:', error);
    return { data: null, error };
  }
};

/**
 * Create a new fitness goal
 */
export const createFitnessGoal = async (
  userId: string,
  goalData: Omit<FitnessGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{
  data: FitnessGoal | null;
  error: any;
}> => {
  try {
    const newGoal = {
      id: uuidv4(),
      user_id: userId,
      name: goalData.name,
      description: goalData.description,
      title: goalData.name, // Add title for compatibility
      target_weight: goalData.target_weight,
      target_body_fat: goalData.target_body_fat,
      target_date: goalData.target_date,
      status: goalData.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('fitness_goals')
      .insert([newGoal])
      .select()
      .returns<FitnessGoal[]>();
      
    if (error) throw error;
    
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error creating fitness goal:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing fitness goal
 */
export const updateFitnessGoal = async (
  goalId: string,
  goalData: Partial<Omit<FitnessGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{
  data: FitnessGoal | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('fitness_goals')
      .update(goalData)
      .eq('id', goalId)
      .select()
      .returns<FitnessGoal[]>();
      
    if (error) throw error;
    
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error updating fitness goal:', error);
    return { data: null, error };
  }
};

/**
 * Delete a fitness goal
 */
export const deleteGoal = async (goalId: string): Promise<{
  success: boolean;
  error: any;
}> => {
  try {
    const { error } = await supabase
      .from('fitness_goals')
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
 * Update goal status based on progress
 */
export const updateGoalStatusBasedOnProgress = async (
  userId: string,
  goalId: string,
  currentValue: number,
  targetValue: number
): Promise<{
  success: boolean;
  error: any;
}> => {
  try {
    let newStatus: FitnessGoal['status'] = 'active';
    
    if (currentValue >= targetValue) {
      newStatus = 'completed';
    }
    
    const { error } = await supabase
      .from('fitness_goals')
      .update({ status: newStatus })
      .eq('id', goalId)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating goal status:', error);
    return { success: false, error };
  }
};
