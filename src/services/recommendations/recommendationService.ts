
import { supabase } from '@/integrations/supabase/client';
import { WorkoutRecommendation } from '@/types/fitness/recommendations';

export const fetchUserRecommendations = async (userId: string): Promise<WorkoutRecommendation[]> => {
  const { data, error } = await supabase
    .from('workout_recommendations')
    .select('*')
    .eq('user_id', userId)
    .eq('dismissed', false)
    .eq('applied', false)
    .order('confidence_score', { ascending: false });

  if (error) throw error;
  
  // Map the database fields to match the WorkoutRecommendation interface
  return (data || []).map(item => ({
    id: item.id,
    user_id: item.user_id,
    title: item.title,
    description: item.description,
    type: item.type,
    reason: item.reason,
    confidence_score: item.confidence_score,
    metadata: item.metadata,
    suggested_at: item.suggested_at,
    applied: item.applied,
    applied_at: item.applied_at,
    dismissed: item.dismissed,
    dismissed_at: item.dismissed_at,
    expires_at: item.expires_at,
    created_at: item.created_at,
    updated_at: item.updated_at
  })) as WorkoutRecommendation[];
};

export const applyRecommendation = async (recommendationId: string, userId: string) => {
  const { error } = await supabase
    .from('workout_recommendations')
    .update({ 
      applied: true,
      applied_at: new Date().toISOString()
    })
    .eq('id', recommendationId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const dismissRecommendation = async (recommendationId: string, userId: string) => {
  const { error } = await supabase
    .from('workout_recommendations')
    .update({ 
      dismissed: true,
      dismissed_at: new Date().toISOString()
    })
    .eq('id', recommendationId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const generateRecommendations = async (userId: string) => {
  // This would be called by a background service or edge function
  // For now, let's create some sample recommendations
  const sampleRecommendations = [
    {
      user_id: userId,
      title: "Increase Your Cardio",
      description: "Based on your recent workouts, adding more cardio could help improve your endurance.",
      type: 'workout_plan' as const,
      reason: "Low cardio activity detected in recent sessions",
      confidence_score: 0.8,
      metadata: { workout_type: 'cardio', duration: 30 }
    },
    {
      user_id: userId,
      title: "Try Upper Body Focus",
      description: "Your lower body workouts are consistent. Let's balance with more upper body exercises.",
      type: 'exercise_variation' as const,
      reason: "Muscle group balance analysis",
      confidence_score: 0.75,
      metadata: { focus: 'upper_body', exercises: ['push_ups', 'pull_ups', 'rows'] }
    },
    {
      user_id: userId,
      title: "Progressive Overload Suggestion",
      description: "You've been consistent with your current weights. Time to increase the challenge!",
      type: 'progression' as const,
      reason: "Performance plateau detected",
      confidence_score: 0.85,
      metadata: { suggested_increase: '5-10%' }
    }
  ];

  const { error } = await supabase
    .from('workout_recommendations')
    .insert(sampleRecommendations);

  if (error) throw error;
};
