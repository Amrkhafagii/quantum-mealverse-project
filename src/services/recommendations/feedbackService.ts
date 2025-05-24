
import { supabase } from '@/integrations/supabase/client';
import { RecommendationFeedback } from '@/types/fitness/recommendations';

export const submitRecommendationFeedback = async (
  userId: string,
  recommendationId: string,
  feedbackType: RecommendationFeedback['feedback_type'],
  rating?: number,
  comments?: string
) => {
  const { error } = await supabase
    .from('recommendation_feedback')
    .insert({
      user_id: userId,
      recommendation_id: recommendationId,
      feedback_type: feedbackType,
      rating,
      comments
    });

  if (error) throw error;
};

export const getRecommendationFeedback = async (userId: string, recommendationId: string) => {
  const { data, error } = await supabase
    .from('recommendation_feedback')
    .select('*')
    .eq('user_id', userId)
    .eq('recommendation_id', recommendationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
