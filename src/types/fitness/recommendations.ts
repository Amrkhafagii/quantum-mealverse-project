
export interface WorkoutRecommendation {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  reason: string;
  confidence_score: number;
  metadata?: any;
  suggested_at: string;
  applied: boolean;
  applied_at?: string;
  dismissed: boolean;
  dismissed_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Legacy compatibility fields
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes?: number;
  target_muscle_groups?: string[];
  recommended_frequency?: number;
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
