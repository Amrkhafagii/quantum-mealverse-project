
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
      const { error } = await supabase.rpc('generate_workout_recommendations', {
        p_user_id: user.id
      });

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
      const { error } = await supabase
        .from('recommendation_feedback')
        .insert([{
          user_id: user.id,
          recommendation_id: recommendationId,
          feedback_type: feedbackType,
          rating,
          comments
        }]);

      if (error) throw error;

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
