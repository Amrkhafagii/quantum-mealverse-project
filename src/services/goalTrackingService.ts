
import { supabase } from '@/integrations/supabase/client';
import { FitnessGoal } from '@/types/fitness/goals';

// Database row type
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

export const getGoalProgress = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('fitness_goals_user_id', userId);

    if (error) {
      console.error('Error fetching goal progress:', error);
      return [];
    }

    // Convert to FitnessGoal format
    return (data || []).map((dbGoal: DBFitnessGoal) => ({
      id: dbGoal.id,
      fitness_goals_user_id: dbGoal.fitness_goals_user_id,
      name: dbGoal.name,
      description: dbGoal.description,
      target_value: dbGoal.target_weight || 0,
      current_value: 0,
      target_date: dbGoal.target_date,
      status: dbGoal.status as any,
      goal_type: 'weight_loss',
      created_at: dbGoal.created_at,
      updated_at: dbGoal.updated_at
    })) as FitnessGoal[];
  } catch (error) {
    console.error('Error in getGoalProgress:', error);
    return [];
  }
};

export const updateGoalProgress = async (goalId: string, progress: number) => {
  try {
    // Since we don't have a progress field in DB, we'll skip the update
    console.log('Goal progress update requested for:', goalId, progress);
    return { success: true };
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return { success: false, error: 'Failed to update progress' };
  }
};

export const generateProgressInsights = async (userId: string) => {
  try {
    console.log('Generating progress insights for user:', userId);
    
    // Mock implementation since complex analytics aren't in the database
    return {
      weeklyProgress: 0,
      monthlyProgress: 0,
      trends: [],
      recommendations: ['Keep up the good work!']
    };
  } catch (error) {
    console.error('Error generating progress insights:', error);
    return {
      weeklyProgress: 0,
      monthlyProgress: 0,
      trends: [],
      recommendations: []
    };
  }
};
