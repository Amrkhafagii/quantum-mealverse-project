// Only import the types you need directly to avoid deep recursion
import { useEffect, useState } from 'react';
import type { WorkoutRecommendation, RecommendationFeedback } from '@/types/fitness/recommendations';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [feedback, setFeedback] = useState<RecommendationFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchRecommendations();
      fetchFeedback();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_recommendations')
        .select('*')
        .eq('workout_recommendations_user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      setRecommendations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recommendation_feedback')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }
      setFeedback(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      console.error("Error fetching feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const giveFeedback = async (recommendationId: string, feedbackType: 'positive' | 'negative' | 'neutral', rating?: number, comments?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recommendation_feedback')
        .insert([
          {
            user_id: user.id,
            recommendation_id: recommendationId,
            feedback_type: feedbackType,
            rating: rating,
            comments: comments
          }
        ]);

      if (error) {
        throw new Error(error.message);
      }

      setFeedback(prevFeedback => [
        ...prevFeedback,
        {
          user_id: user.id,
          recommendation_id: recommendationId,
          feedback_type: feedbackType,
          rating: rating,
          comments: comments
        }
      ]);
      toast({
        title: "Success",
        description: "Feedback submitted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      console.error("Error submitting feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendations,
    feedback,
    isLoading,
    fetchRecommendations,
    fetchFeedback,
    giveFeedback,
  };
};
