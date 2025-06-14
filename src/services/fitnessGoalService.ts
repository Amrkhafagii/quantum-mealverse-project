
import { supabase } from '@/integrations/supabase/client';
import { FitnessGoal } from '@/types/fitness/goals';

// Database row type that matches exactly to the Supabase columns
interface DBFitnessGoal {
  id: string;
  fitness_goals_user_id: string;
  name: string;
  description: string;
  target_weight?: number;
  target_body_fat?: number;
  target_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Creates a new fitness goal for a user
 */
export const createFitnessGoal = async (userId: string, goal: Partial<FitnessGoal>): Promise<{ success: boolean; goal?: FitnessGoal; error?: string }> => {
  try {
    console.log('Creating fitness goal for user:', userId, goal);
    
    // Convert the FitnessGoal to DB format
    const dbGoal = {
      fitness_goals_user_id: userId,
      name: goal.name || goal.title || 'Untitled Goal',
      description: goal.description || '',
      target_weight: goal.target_weight || goal.target_value,
      target_body_fat: goal.target_body_fat,
      target_date: goal.target_date,
      status: goal.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('fitness_goals')
      .insert(dbGoal)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating fitness goal:', error);
      return { success: false, error: error.message };
    }
    
    if (!data) {
      return { success: false, error: 'No data returned' };
    }
    
    // Convert DB result back to FitnessGoal
    const resultGoal: FitnessGoal = {
      id: data.id,
      fitness_goals_user_id: data.fitness_goals_user_id,
      name: data.name,
      description: data.description,
      target_value: data.target_weight || 0,
      current_value: 0,
      target_date: data.target_date,
      status: data.status as any,
      goal_type: 'weight_loss',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    console.log('Fitness goal created successfully:', resultGoal);
    return { success: true, goal: resultGoal };
  } catch (error) {
    console.error('Error in createFitnessGoal:', error);
    return { success: false, error: 'Failed to create fitness goal' };
  }
};

/**
 * Get fitness goals for a user from the database
 */
export const getFitnessGoalsFromDB = async (userId: string): Promise<FitnessGoal[]> => {
  try {
    console.log('Fetching fitness goals for user:', userId);
    
    const { data, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('fitness_goals_user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching fitness goals:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('No fitness goals found for user:', userId);
      return [];
    }
    
    // Convert DB results to FitnessGoal format
    const goals: FitnessGoal[] = data.map((dbGoal: DBFitnessGoal) => ({
      id: dbGoal.id,
      fitness_goals_user_id: dbGoal.fitness_goals_user_id,
      name: dbGoal.name,
      description: dbGoal.description,
      target_value: dbGoal.target_weight || 0,
      current_value: 0, // This would need to be calculated or stored separately
      target_date: dbGoal.target_date,
      status: dbGoal.status as any,
      goal_type: 'weight_loss', // Default since it's not in the DB schema
      created_at: dbGoal.created_at,
      updated_at: dbGoal.updated_at
    }));
    
    console.log('Retrieved fitness goals:', goals);
    return goals;
  } catch (error) {
    console.error('Error in getFitnessGoalsFromDB:', error);
    return [];
  }
};

/**
 * Update a fitness goal in the database
 */
export const updateFitnessGoal = async (goalId: string, updates: Partial<FitnessGoal>): Promise<{ success: boolean; goal?: FitnessGoal; error?: string }> => {
  try {
    console.log('Updating fitness goal:', goalId, updates);
    
    // Convert updates to DB format
    const dbUpdates: Partial<DBFitnessGoal> = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.name || updates.title) {
      dbUpdates.name = updates.name || updates.title;
    }
    if (updates.description) {
      dbUpdates.description = updates.description;
    }
    if (updates.target_weight || updates.target_value) {
      dbUpdates.target_weight = updates.target_weight || updates.target_value;
    }
    if (updates.target_body_fat) {
      dbUpdates.target_body_fat = updates.target_body_fat;
    }
    if (updates.target_date) {
      dbUpdates.target_date = updates.target_date;
    }
    if (updates.status) {
      dbUpdates.status = updates.status;
    }
    
    const { data, error } = await supabase
      .from('fitness_goals')
      .update(dbUpdates)
      .eq('id', goalId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating fitness goal:', error);
      return { success: false, error: error.message };
    }
    
    if (!data) {
      return { success: false, error: 'No data returned' };
    }
    
    // Convert DB result back to FitnessGoal
    const resultGoal: FitnessGoal = {
      id: data.id,
      fitness_goals_user_id: data.fitness_goals_user_id,
      name: data.name,
      description: data.description,
      target_value: data.target_weight || 0,
      current_value: 0,
      target_date: data.target_date,
      status: data.status as any,
      goal_type: 'weight_loss',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    console.log('Fitness goal updated successfully:', resultGoal);
    return { success: true, goal: resultGoal };
  } catch (error) {
    console.error('Error in updateFitnessGoal:', error);
    return { success: false, error: 'Failed to update fitness goal' };
  }
};

/**
 * Delete a fitness goal from the database
 */
export const deleteFitnessGoal = async (goalId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Deleting fitness goal:', goalId);
    
    const { error } = await supabase
      .from('fitness_goals')
      .delete()
      .eq('id', goalId);
    
    if (error) {
      console.error('Error deleting fitness goal:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Fitness goal deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteFitnessGoal:', error);
    return { success: false, error: 'Failed to delete fitness goal' };
  }
};

/**
 * Get a single fitness goal by ID
 */
export const getFitnessGoalById = async (goalId: string): Promise<FitnessGoal | null> => {
  try {
    console.log('Fetching fitness goal by ID:', goalId);
    
    const { data, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('id', goalId)
      .single();
    
    if (error) {
      console.error('Error fetching fitness goal:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Convert DB result to FitnessGoal
    const goal: FitnessGoal = {
      id: data.id,
      fitness_goals_user_id: data.fitness_goals_user_id,
      name: data.name,
      description: data.description,
      target_value: data.target_weight || 0,
      current_value: 0,
      target_date: data.target_date,
      status: data.status as any,
      goal_type: 'weight_loss',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    return goal;
  } catch (error) {
    console.error('Error in getFitnessGoalById:', error);
    return null;
  }
};
