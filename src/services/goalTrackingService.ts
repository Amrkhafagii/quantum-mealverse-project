
import { supabase } from '@/integrations/supabase/client';

// Define a simplified FitnessGoal type that matches what we actually need
interface SimpleFitnessGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  goal_type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength';
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  target_date?: string;
  created_at: string;
  updated_at: string;
}

type TrendStatus = 'improving' | 'declining' | 'maintaining' | 'insufficient_data';

/**
 * Track progress towards a fitness goal
 */
export const trackGoalProgress = async (
  userId: string,
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
      .eq('fitness_goals_user_id', userId);
      
    if (updateError) throw updateError;
    
    // Check if goal is completed
    const { data: goal, error: fetchError } = await supabase
      .from('fitness_goals')
      .select('target_weight, status')
      .eq('id', goalId)
      .eq('fitness_goals_user_id', userId)
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
        .eq('fitness_goals_user_id', userId);
        
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
  userId: string,
  goalId?: string
): Promise<any[]> => {
  try {
    let query = supabase
      .from('fitness_goals')
      .select('*')
      .eq('fitness_goals_user_id', userId)
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
export const calculateGoalCompletion = (goal: SimpleFitnessGoal): number => {
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
      .eq('fitness_goals_user_id', userId);
      
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

/**
 * Generate progress insights based on user's fitness data
 */
export const generateProgressInsights = async (userId: string): Promise<{
  insights: string[];
  trends: {
    weight: TrendStatus;
    bodyFat: TrendStatus;
  };
}> => {
  try {
    const { data: goals, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('fitness_goals_user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const insights: string[] = [];
    let trends: {
      weight: TrendStatus;
      bodyFat: TrendStatus;
    } = {
      weight: 'insufficient_data',
      bodyFat: 'insufficient_data'
    };

    if (!goals || goals.length === 0) {
      insights.push('Start tracking your fitness goals to see progress insights.');
      return { insights, trends };
    }

    // Analyze weight goals - convert database data to SimpleFitnessGoal interface
    const weightGoals = goals.filter(g => g.name?.toLowerCase().includes('weight'));
    if (weightGoals.length > 0) {
      const recentWeight = weightGoals[0];
      // Create a SimpleFitnessGoal-compatible object
      const goalData: SimpleFitnessGoal = {
        id: recentWeight.id,
        user_id: recentWeight.user_id,
        title: recentWeight.name || 'Weight Goal',
        description: recentWeight.description,
        target_value: recentWeight.target_weight || 0,
        current_value: 0, // Default since it's not in the database schema
        goal_type: 'weight_loss',
        status: (recentWeight.status === 'completed' || recentWeight.status === 'active') 
          ? recentWeight.status 
          : 'active',
        start_date: recentWeight.created_at,
        target_date: recentWeight.target_date,
        created_at: recentWeight.created_at,
        updated_at: recentWeight.updated_at
      };
      
      const completion = calculateGoalCompletion(goalData);
      
      if (completion > 75) {
        insights.push(`Great progress on your weight goal! You're ${completion.toFixed(0)}% there.`);
        trends.weight = 'improving';
      } else if (completion > 25) {
        insights.push(`You're making steady progress on your weight goal (${completion.toFixed(0)}% complete).`);
        trends.weight = 'maintaining';
      } else {
        insights.push('Keep pushing towards your weight goal. Every small step counts!');
        trends.weight = 'declining';
      }
    }

    // Analyze overall goal completion
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const completionRate = (completedGoals / goals.length) * 100;
    
    if (completionRate > 70) {
      insights.push('Excellent! You have a high goal completion rate. Keep up the momentum!');
    } else if (completionRate > 30) {
      insights.push('You\'re building good habits. Consider breaking larger goals into smaller milestones.');
    } else {
      insights.push('Focus on one goal at a time to build consistency and momentum.');
    }

    return { insights, trends };
  } catch (error) {
    console.error('Error generating progress insights:', error);
    return {
      insights: ['Unable to generate insights at this time.'],
      trends: {
        weight: 'insufficient_data',
        bodyFat: 'insufficient_data'
      }
    };
  }
};
