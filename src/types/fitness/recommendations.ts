
export interface WorkoutRecommendation {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: 'workout_plan' | 'exercise_variation' | 'difficulty_adjustment' | 'recovery' | 'progression' | 'general';
  reason?: string;
  confidence_score: number;
  metadata?: any;
  suggested_at: string;
  applied: boolean;
  applied_at?: string;
  dismissed: boolean;
  dismissed_at?: string;
  expires_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutAdaptation {
  id: string;
  user_id: string;
  workout_plan_id?: string;
  exercise_name?: string;
  adaptation_type: 'increase_weight' | 'decrease_weight' | 'increase_reps' | 'decrease_reps' | 'increase_sets' | 'decrease_sets' | 'substitute_exercise' | 'add_rest';
  old_value?: any;
  new_value?: any;
  reason?: string;
  applied_at: string;
  created_at?: string;
}

export interface RecommendationFeedback {
  id: string;
  user_id: string;
  recommendation_id: string;
  feedback_type: 'helpful' | 'not_helpful' | 'too_easy' | 'too_hard' | 'irrelevant';
  rating?: number;
  comments?: string;
  created_at?: string;
}

export interface UserWorkoutPreferences {
  preferred_workout_duration: number;
  preferred_workout_frequency: number;
  preferred_workout_types: string[];
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  available_equipment: string[];
  injury_history?: string[];
  time_constraints?: any;
  intensity_preference: 'low' | 'moderate' | 'high';
  auto_progression: boolean;
}
