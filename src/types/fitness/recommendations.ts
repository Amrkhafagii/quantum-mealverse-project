
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
