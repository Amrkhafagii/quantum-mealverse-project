
import { RecommendationFeedback } from '@/types/fitness/recommendations';

export const submitRecommendationFeedback = async (
  userId: string,
  recommendationId: string,
  feedbackType: RecommendationFeedback['feedback_type'],
  rating?: number,
  comments?: string
) => {
  // For now, just log the feedback since the table might not exist yet
  console.log('Feedback submitted:', {
    user_id: userId,
    recommendation_id: recommendationId,
    feedback_type: feedbackType,
    rating,
    comments
  });
};
