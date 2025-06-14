
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { MealType } from '@/types/meal';

// Use correct imports that exist for all recommendation actions
import {
  fetchUserRecommendations,
  applyRecommendation,
  dismissRecommendation,
  generateRecommendations,
} from '@/services/recommendations/recommendationService';
import { submitRecommendationFeedback } from '@/services/recommendations/feedbackService';
import { IntelligentRecommendationEngine } from '@/services/recommendations/intelligentRecommendationEngine';

export function useRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<MealType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchRecommendations = async (): Promise<void> => {
    if (!user) return;
    try {
      setIsLoading(true);
      // Fetch meal recommendations for the user (note: this returns WorkoutRecommendation[] by default but should be adapted for meals)
      const data: MealType[] = await fetchUserRecommendations(user.id);
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching meal recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load meal recommendations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendationsHandler = async () => {
    if (!user) return;
    try {
      await IntelligentRecommendationEngine.generatePersonalizedRecommendations(user.id);

      toast({
        title: "Success",
        description: "New personalized meal recommendations generated!",
      });

      fetchRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
      try {
        await generateRecommendations(user.id);
        toast({
          title: "Success",
          description: "New recommendations generated!",
        });
        fetchRecommendations();
      } catch (fallbackError) {
        toast({
          title: "Error",
          description: "Failed to generate recommendations",
          variant: "destructive"
        });
      }
    }
  };

  const applyRecommendationHandler = async (recommendationId: string) => {
    if (!user) return;
    try {
      await applyRecommendation(recommendationId, user.id);

      toast({
        title: "Recommendation Applied",
        description: "We've updated your meal plan accordingly",
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

  const dismissRecommendationHandler = async (recommendationId: string) => {
    if (!user) return;
    try {
      await dismissRecommendation(recommendationId, user.id);

      toast({
        title: "Recommendation Dismissed",
        description: "We won't show this meal again",
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
    feedbackType: string, // Union type if exists
    rating?: number,
    comments?: string
  ) => {
    if (!user) return;
    try {
      await submitRecommendationFeedback(user.id, recommendationId, feedbackType, rating, comments);

      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping us improve your meal recommendations!",
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
    // Depend only on user?.id for stability
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    recommendations,
    isLoading,
    fetchRecommendations,
    generateRecommendations: generateRecommendationsHandler,
    applyRecommendation: applyRecommendationHandler,
    dismissRecommendation: dismissRecommendationHandler,
    submitFeedback
  };
}
