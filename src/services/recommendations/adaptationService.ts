
import { supabase } from '@/integrations/supabase/client';

export interface WorkoutAdaptation {
  id: string;
  user_id: string;
  workout_plan_id?: string;
  exercise_name?: string;
  adaptation_type: 'increase_weight' | 'decrease_weight' | 'increase_reps' | 'decrease_reps' | 'increase_sets' | 'decrease_sets' | 'substitute_exercise' | 'add_rest';
  old_value?: any;
  new_value?: any;
  reason?: string;
  applied_at: string;
  created_at?: string;
}

export const createWorkoutAdaptation = async (adaptation: Omit<WorkoutAdaptation, 'id' | 'created_at'>) => {
  // Use rpc function to insert into custom table
  const { data, error } = await supabase.rpc('insert_workout_adaptation', {
    p_user_id: adaptation.user_id,
    p_workout_plan_id: adaptation.workout_plan_id,
    p_exercise_name: adaptation.exercise_name,
    p_adaptation_type: adaptation.adaptation_type,
    p_old_value: adaptation.old_value,
    p_new_value: adaptation.new_value,
    p_reason: adaptation.reason,
    p_applied_at: adaptation.applied_at
  });

  if (error) throw error;
  return data;
};

export const getUserAdaptations = async (userId: string) => {
  const { data, error } = await supabase.rpc('get_user_adaptations', {
    p_user_id: userId
  });

  if (error) throw error;
  return data as WorkoutAdaptation[];
};

export const analyzePerformanceAndSuggestAdaptations = async (userId: string) => {
  // Get recent exercise progress
  const { data: progressData, error } = await supabase
    .from('exercise_progress')
    .select('*')
    .eq('user_id', userId)
    .gte('recorded_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('recorded_date', { ascending: false });

  if (error) throw error;

  const adaptations: any[] = [];
  
  // Group by exercise and analyze trends
  const exerciseGroups = progressData?.reduce((acc, item) => {
    if (!acc[item.exercise_name]) {
      acc[item.exercise_name] = [];
    }
    acc[item.exercise_name].push(item);
    return acc;
  }, {} as Record<string, any[]>) || {};

  Object.entries(exerciseGroups).forEach(([exerciseName, records]) => {
    if (records.length >= 3) {
      const recent = records.slice(0, 3);
      const avgWeight = recent.reduce((sum, r) => sum + (r.max_weight || 0), 0) / recent.length;
      const avgReps = recent.reduce((sum, r) => sum + (r.max_reps || 0), 0) / recent.length;
      
      // Check for stagnation
      const weightVariation = Math.max(...recent.map(r => r.max_weight || 0)) - Math.min(...recent.map(r => r.max_weight || 0));
      
      if (weightVariation < avgWeight * 0.05) { // Less than 5% variation suggests plateau
        adaptations.push({
          user_id: userId,
          exercise_name: exerciseName,
          adaptation_type: 'increase_weight',
          old_value: { weight: avgWeight },
          new_value: { weight: avgWeight * 1.05 },
          reason: 'Performance plateau detected - time to increase challenge'
        });
      }
    }
  });

  return adaptations;
};
