
import { supabase } from '@/integrations/supabase/client';
import { FitnessGoal } from '@/types/fitness';

/**
 * Track progress towards a fitness goal
 */
export const trackGoalProgress = async (
  userId: string, // UUID from auth
  goalId: string,
  currentValue: number
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Update the goal's current progress
    const { error: updateError } = await supabase
      .from('fitness_goals')
      .update({ 
        current_value: currentValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .eq('user_id', userId); // Use UUID string
      
    if (updateError) throw updateError;
    
    // Check if goal is completed
    const { data: goal, error: fetchError } = await supabase
      .from('fitness_goals')
      .select('target_weight, status')
      .eq('id', goalId)
      .eq('user_id', userId) // Use UUID string
      .single();
      
    if (fetchError) throw fetchError;
    
    // Update status if goal is achieved
    if (goal && currentValue >= (goal.target_weight || 0) && goal.status !== 'completed') {
      const { error: statusError } = await supabase
        .from('fitness_goals')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', userId); // Use UUID string
        
      if (statusError) throw statusError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error tracking goal progress:', error);
    return { success: false, error };
  }
};

/**
 * Get goal progress history for a user
 */
export const getGoalProgressHistory = async (
  userId: string, // UUID from auth
  goalId?: string
): Promise<any[]> => {
  try {
    let query = supabase
      .from('fitness_goals')
      .select('*')
      .eq('user_id', userId) // Use UUID string
      .order('updated_at', { ascending: false });
      
    if (goalId) {
      query = query.eq('id', goalId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching goal progress history:', error);
    return [];
  }
};

/**
 * Calculate goal completion percentage
 */
export const calculateGoalCompletion = (goal: FitnessGoal): number => {
  if (!goal.target_value || goal.target_value === 0) return 0;
  
  const progress = (goal.current_value / goal.target_value) * 100;
  return Math.min(progress, 100);
};

/**
 * Get goals summary for user dashboard
 */
export const getGoalsSummary = async (userId: string): Promise<{
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  completionRate: number;
}> => {
  try {
    const { data: goals, error } = await supabase
      .from('fitness_goals')
      .select('status')
      .eq('user_id', userId); // Use UUID string
      
    if (error) throw error;
    
    const totalGoals = goals?.length || 0;
    const completedGoals = goals?.filter(g => g.status === 'completed').length || 0;
    const activeGoals = goals?.filter(g => g.status === 'active').length || 0;
    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    
    return {
      totalGoals,
      completedGoals,
      activeGoals,
      completionRate
    };
  } catch (error) {
    console.error('Error getting goals summary:', error);
    return {
      totalGoals: 0,
      completedGoals: 0,
      activeGoals: 0,
      completionRate: 0
    };
  }
};
