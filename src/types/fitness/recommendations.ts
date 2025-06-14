
export interface RecommendationFeedback {
  id: string;
  user_id: string;
  recommendation_id: string;
  feedback_type: 'helpful' | 'not_helpful' | 'applied';
  rating?: number;
  comments?: string;
  created_at: string;
}
