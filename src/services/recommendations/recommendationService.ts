
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
  // Provide defaults for fields that don't exist in the database
  return (data || []).map(item => ({
    id: item.id,
    user_id: item.user_id,
    title: item.title || 'Workout Recommendation',
    description: item.description || null,
    type: item.type || 'general',
    reason: item.reason || null,
    confidence_score: item.confidence_score || 0.5,
    metadata: null, // Not in database schema
    suggested_at: item.suggested_at || new Date().toISOString(),
    applied: item.applied || false,
    applied_at: item.applied_at || null,
    dismissed: item.dismissed || false,
    dismissed_at: null, // Not in database schema
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
    created_at: null, // Not in database schema
    updated_at: null // Not in database schema
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
