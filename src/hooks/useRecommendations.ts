
import { useEffect, useState } from 'react';
import type { WorkoutRecommendation, RecommendationFeedback } from '@/types/fitness/recommendations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Only import specific types instead of whole barrels to avoid deep recursion

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

      // Map DB result to strict WorkoutRecommendation shape
      const mapped =
        (data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          difficulty: item.difficulty ?? 'beginner',
          duration_minutes: item.duration_minutes ?? 0,
          target_muscle_groups: item.target_muscle_groups ?? [],
          recommended_frequency: item.recommended_frequency ?? 0,
          created_at: item.created_at,
          // legacy/extra fields for compatibility can be added if needed
        })) as WorkoutRecommendation[];

      setRecommendations(mapped);
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
      // Ensure each feedback record contains required RecommendationFeedback fields
      const mapped =
        (data || []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id ?? item.recommendation_feedback_user_id ?? user.id,
          recommendation_id: item.recommendation_id,
          feedback_type: item.feedback_type,
          rating: item.rating,
          comments: item.comments,
          created_at: item.created_at,
        })) as RecommendationFeedback[];

      setFeedback(mapped);
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

  const giveFeedback = async (
    recommendationId: string,
    feedbackType: 'positive' | 'negative' | 'neutral',
    rating?: number,
    comments?: string
  ) => {
    setIsLoading(true);
    try {
      // Only pass DB columns in insert
      const insertPayload: any = {
        user_id: user.id,
        recommendation_id: recommendationId,
        feedback_type: feedbackType,
      };
      if (typeof rating !== "undefined") insertPayload.rating = rating;
      if (comments) insertPayload.comments = comments;
      const { data, error } = await supabase
        .from('recommendation_feedback')
        .insert([insertPayload]);

      if (error) {
        throw new Error(error.message);
      }

      // Update feedback array with minimal, just id if returned (for UX only, not as DB truth)
      setFeedback(prevFeedback => [
        ...prevFeedback,
        {
          id: data?.[0]?.id ?? Math.random().toString(), // Fallback id
          user_id: user.id,
          recommendation_id: recommendationId,
          feedback_type: feedbackType,
          rating,
          comments,
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
