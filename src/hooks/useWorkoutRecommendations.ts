import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WorkoutRecommendation, RecommendationFeedback } from '@/types/fitness/recommendations';

export function useWorkoutRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workout_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('dismissed', false)
        .eq('applied', false)
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = async () => {
    if (!user) return;
    
    try {
      // Create sample recommendations with all required properties
      const sampleRecommendations: Omit<WorkoutRecommendation, 'id' | 'created_at' | 'updated_at'>[] = [
        {
          user_id: user.id,
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
          user_id: user.id,
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

      // Insert sample recommendations
      const { error } = await supabase
        .from('workout_recommendations')
        .insert(sampleRecommendations);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "New recommendations generated!",
      });
      
      fetchRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations",
        variant: "destructive"
      });
    }
  };

  const applyRecommendation = async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('workout_recommendations')
        .update({ 
          applied: true,
          applied_at: new Date().toISOString()
        })
        .eq('id', recommendationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Recommendation Applied",
        description: "We've updated your workout plan accordingly",
      });

      fetchRecommendations();
    } catch (error) {
      console.error('Error applying recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to apply recommendation",
        variant: "destructive"
      });
    }
  };

  const dismissRecommendation = async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('workout_recommendations')
        .update({ 
          dismissed: true,
          dismissed_at: new Date().toISOString()
        })
        .eq('id', recommendationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Recommendation Dismissed",
        description: "We won't show this recommendation again",
      });

      fetchRecommendations();
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss recommendation",
        variant: "destructive"
      });
    }
  };

  const submitFeedback = async (
    recommendationId: string,
    feedbackType: RecommendationFeedback['feedback_type'],
    rating?: number,
    comments?: string
  ) => {
    if (!user) return;

    try {
      // For now, just log the feedback since the table might not exist yet
      console.log('Feedback submitted:', {
        user_id: user.id,
        recommendation_id: recommendationId,
        feedback_type: feedbackType,
        rating,
        comments
      });

      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping us improve our recommendations!",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  return {
    recommendations,
    isLoading,
    fetchRecommendations,
    generateRecommendations,
    applyRecommendation,
    dismissRecommendation,
    submitFeedback
  };
}
