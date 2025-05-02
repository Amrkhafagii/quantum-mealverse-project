
import { supabase } from '@/integrations/supabase/client';
import { FitnessGoal } from '@/types/fitness';

// Get all fitness goals for a user
export async function getUserFitnessGoals(userId: string) {
  try {
    const { data, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    return { data, error };
  } catch (error) {
    console.error('Error fetching fitness goals:', error);
    return { data: null, error };
  }
}

// Get a single fitness goal by ID
export async function getFitnessGoalById(goalId: string) {
  try {
    const { data, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('id', goalId)
      .single();
      
    return { data, error };
  } catch (error) {
    console.error('Error fetching fitness goal:', error);
    return { data: null, error };
  }
}

// Add a new fitness goal
export async function addFitnessGoal(goal: FitnessGoal) {
  try {
    // Make sure 'description' isn't required for the insert
    const goalData = {
      id: goal.id,
      user_id: goal.user_id,
      name: goal.name,
      description: goal.description || '',  // Default to empty string if not provided
      target_date: goal.target_date,
      target_weight: goal.target_weight,
      target_body_fat: goal.target_body_fat,
      status: goal.status || 'active',
      created_at: goal.created_at,
      updated_at: goal.updated_at
    };

    const { data, error } = await supabase
      .from('fitness_goals')
      .insert(goalData)
      .select()
      .single();
      
    return { data, error };
  } catch (error) {
    console.error('Error adding fitness goal:', error);
    return { data: null, error };
  }
}

// Update an existing fitness goal
export async function updateFitnessGoal(goal: FitnessGoal) {
  try {
    // Make sure 'description' isn't required for the update
    const goalData = {
      name: goal.name,
      description: goal.description || '',  // Default to empty string if not provided
      target_date: goal.target_date,
      target_weight: goal.target_weight,
      target_body_fat: goal.target_body_fat,
      status: goal.status,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('fitness_goals')
      .update(goalData)
      .eq('id', goal.id)
      .select()
      .single();
      
    return { data, error };
  } catch (error) {
    console.error('Error updating fitness goal:', error);
    return { data: null, error };
  }
}

// Delete a fitness goal
export async function deleteFitnessGoal(goalId: string) {
  try {
    const { error } = await supabase
      .from('fitness_goals')
      .delete()
      .eq('id', goalId);
      
    return { success: !error, error };
  } catch (error) {
    console.error('Error deleting fitness goal:', error);
    return { success: false, error };
  }
}

// Update the status of a goal (active, completed, abandoned)
export async function updateGoalStatus(goalId: string, status: 'active' | 'completed' | 'abandoned') {
  try {
    const { error } = await supabase
      .from('fitness_goals')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'completed' ? { completed_date: new Date().toISOString() } : {})
      })
      .eq('id', goalId);
      
    return { success: !error, error };
  } catch (error) {
    console.error('Error updating goal status:', error);
    return { success: false, error };
  }
}
