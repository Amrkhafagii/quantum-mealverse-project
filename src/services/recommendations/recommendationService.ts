
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
  return data || [];
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
