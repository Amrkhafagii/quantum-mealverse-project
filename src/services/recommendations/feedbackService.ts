
import { supabase } from '@/integrations/supabase/client';
import { RecommendationFeedback } from '@/types/fitness/recommendations';

export const submitRecommendationFeedback = async (
  userId: string,
  recommendationId: string,
  feedbackType: RecommendationFeedback['feedback_type'],
  rating?: number,
  comments?: string
) => {
  // Use rpc function to insert feedback
  const { error } = await supabase.rpc('insert_recommendation_feedback', {
    p_user_id: userId,
    p_recommendation_id: recommendationId,
    p_feedback_type: feedbackType,
    p_rating: rating,
    p_comments: comments
  });

  if (error) throw error;
};

export const getRecommendationFeedback = async (userId: string, recommendationId: string) => {
  const { data, error } = await supabase.rpc('get_recommendation_feedback', {
    p_user_id: userId,
    p_recommendation_id: recommendationId
  });

  if (error) throw error;
  return data;
};
