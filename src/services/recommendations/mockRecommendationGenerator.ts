
import { supabase } from '@/integrations/supabase/client';
import { WorkoutRecommendation } from '@/types/fitness/recommendations';

export const generateMockRecommendations = async (userId: string) => {
  const sampleRecommendations: Omit<WorkoutRecommendation, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      user_id: userId,
      title: "Increase Your Cardio",
      description: "Based on your recent workouts, adding more cardio could help improve your endurance.",
      type: 'workout_plan' as const,
      reason: "Low cardio activity detected in recent sessions",
      confidence_score: 0.8,
      metadata: { workout_type: 'cardio', duration: 30 },
      suggested_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      applied: false,
      dismissed: false
    },
    {
      user_id: userId,
      title: "Try Upper Body Focus",
      description: "Your lower body workouts are consistent. Let's balance with more upper body exercises.",
      type: 'exercise_variation' as const,
      reason: "Muscle group balance analysis",
      confidence_score: 0.75,
      metadata: { focus: 'upper_body', exercises: ['push_ups', 'pull_ups', 'rows'] },
      suggested_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      applied: false,
      dismissed: false
    }
  ];

  const { error } = await supabase
    .from('workout_recommendations')
    .insert(sampleRecommendations);

  if (error) throw error;
};
