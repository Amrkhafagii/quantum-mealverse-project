
export interface WorkoutRecommendation {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  target_muscle_groups: string[];
  recommended_frequency: number;
  created_at: string;
}

// Add RecommendationFeedback for compatibility with old hooks
export interface RecommendationFeedback {
  id: string;
  user_id: string;
  recommendation_id: string;
  feedback_type: 'positive' | 'negative' | 'neutral';
  rating?: number;
  comments?: string;
  created_at?: string;
}
