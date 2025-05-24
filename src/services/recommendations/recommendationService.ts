
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
  
  // Ensure data matches WorkoutRecommendation type by providing defaults for missing fields
  return (data || []).map(item => ({
    ...item,
    expires_at: item.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: item.metadata || null,
    description: item.description || null,
    reason: item.reason || null,
    applied_at: item.applied_at || null,
    dismissed_at: item.dismissed_at || null,
    created_at: item.created_at || null,
    updated_at: item.updated_at || null
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
