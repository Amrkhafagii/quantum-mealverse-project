import { supabase } from '@/integrations/supabase/client';
import { FitnessGoal, GoalStatus } from '@/types/fitness';
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
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Map database fields to FitnessGoal interface
    const mappedGoals: FitnessGoal[] = (data || []).map(goal => ({
      id: goal.id,
      user_id: goal.user_id,
      title: goal.name, // Map name to title for interface compatibility
      name: goal.name,
      description: goal.description,
      target_value: goal.target_weight || 0,
      current_value: 0,
      start_date: goal.created_at,
      target_date: goal.target_date || '',
      category: 'weight', // Default category
      status: goal.status as GoalStatus, // Type-cast status to GoalStatus
      target_weight: goal.target_weight,
      target_body_fat: goal.target_body_fat,
      created_at: goal.created_at,
      updated_at: goal.updated_at
    }));
    
    return { data: mappedGoals, error: null };
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
      name: goalData.title || goalData.name, // Use either title or name
      description: goalData.description,
      title: goalData.title || goalData.name, // For interface compatibility
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
      .select();
      
    if (error) throw error;
    
    // Map the response to match our interface
    const mappedGoal: FitnessGoal = {
      ...data[0],
      title: data[0].name,
      target_value: data[0].target_weight || 0,
      current_value: 0,
      start_date: data[0].created_at,
      category: 'weight'
    };
    
    return { data: mappedGoal, error: null };
  } catch (error) {
    console.error('Error creating fitness goal:', error);
    return { data: null, error };
  }
};

/**
 * Create a new fitness goal (alias for GoalManagement.tsx compatibility)
 */
export const addFitnessGoal = async (goalData: FitnessGoal): Promise<{
  data: FitnessGoal | null;
  error: any;
}> => {
  try {
    // Extract fields for database insert
    const { name, description, target_weight, target_body_fat, target_date, status, user_id } = goalData;
    
    // Insert into database
    const { data, error } = await supabase
      .from('fitness_goals')
      .insert([{
        user_id,
        name: name || goalData.title, // Use either name or title
        description,
        target_weight,
        target_body_fat,
        target_date,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
      
    if (error) throw error;
    
    // Return the data mapped to our interface
    const mappedGoal: FitnessGoal = {
      ...goalData,
      id: data[0].id,
      created_at: data[0].created_at,
      updated_at: data[0].updated_at
    };
    
    return { data: mappedGoal, error: null };
  } catch (error) {
    console.error('Error adding fitness goal:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing fitness goal
 */
export const updateFitnessGoal = async (
  goalId: string,
  goalData: FitnessGoal
): Promise<{
  data: FitnessGoal | null;
  error: any;
}> => {
  try {
    // Extract fields for database update
    const { name, description, target_weight, target_body_fat, target_date, status } = goalData;
    
    // Update in database
    const { data, error } = await supabase
      .from('fitness_goals')
      .update({
        name: name || goalData.title, // Use either name or title
        description,
        target_weight,
        target_body_fat,
        target_date,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select();
      
    if (error) throw error;
    
    // Return the data mapped to our interface
    const mappedGoal: FitnessGoal = {
      ...goalData,
      id: data[0].id,
      name: data[0].name,
      title: data[0].name,
      updated_at: data[0].updated_at,
      status: data[0].status as GoalStatus // Type-cast status to GoalStatus
    };
    
    return { data: mappedGoal, error: null };
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
 * Delete a fitness goal (alias for GoalManagement.tsx compatibility)
 */
export const deleteFitnessGoal = async (goalId: string): Promise<{
  success: boolean;
  error: any;
}> => {
  return deleteGoal(goalId);
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
    let newStatus: GoalStatus = 'active';
    
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

/**
 * Update a goal's status (alias for GoalManagement.tsx compatibility)
 */
export const updateGoalStatus = async (
  goalId: string,
  status: GoalStatus
): Promise<{
  error: any;
}> => {
  try {
    const { error } = await supabase
      .from('fitness_goals')
      .update({ status })
      .eq('id', goalId);
      
    if (error) throw error;
    
    return { error: null };
  } catch (error) {
    console.error('Error updating goal status:', error);
    return { error };
  }
};

/**
 * Fetch goals for a user
 */
export const fetchGoals = async (userId: string): Promise<FitnessGoal[]> => {
  try {
    const { data, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to ensure proper typing
    const typedGoals = data?.map(goal => ({
      ...goal,
      status: goal.status as GoalStatus, // Cast the status to GoalStatus type
    })) || [];
    
    return typedGoals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
};
