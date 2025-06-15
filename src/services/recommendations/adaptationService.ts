
import { supabase } from '@/integrations/supabase/client';

export interface WorkoutAdaptation {
  id: string;
  user_id: string; // This maps to workout_adaptations_user_id in DB
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
  const { data, error } = await supabase
    .from('workout_adaptations')
    .insert({
      workout_adaptations_user_id: adaptation.user_id, // Use correct DB field name
      workout_plan_id: adaptation.workout_plan_id,
      exercise_name: adaptation.exercise_name,
      adaptation_type: adaptation.adaptation_type,
      old_value: adaptation.old_value,
      new_value: adaptation.new_value,
      reason: adaptation.reason,
      applied_at: adaptation.applied_at
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserAdaptations = async (userId: string) => {
  const { data, error } = await supabase
    .from('workout_adaptations')
    .select('*')
    .eq('workout_adaptations_user_id', userId) // Use correct DB field name
    .order('applied_at', { ascending: false });

  if (error) throw error;
  
  // Map DB fields to interface
  return (data || []).map(item => ({
    id: item.id,
    user_id: item.workout_adaptations_user_id,
    workout_plan_id: item.workout_plan_id,
    exercise_name: item.exercise_name,
    adaptation_type: item.adaptation_type,
    old_value: item.old_value,
    new_value: item.new_value,
    reason: item.reason,
    applied_at: item.applied_at,
    created_at: item.created_at
  })) as WorkoutAdaptation[];
};

export const analyzePerformanceAndSuggestAdaptations = async (userId: string) => {
  // Get recent exercise progress
  const { data: progressData, error } = await supabase
    .from('exercise_progress')
    .select('*')
    .eq('exercise_progress_user_id', userId) // Use correct DB field name
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
          reason: 'Performance plateau detected - time to increase challenge',
          applied_at: new Date().toISOString()
        });
      }
    }
  });

  return adaptations;
};
