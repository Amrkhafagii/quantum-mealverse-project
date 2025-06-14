
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
// Correct MealType imports:
import type { MealType } from '@/types/meal';
// Use your actual meal recommendation service import (adjust as needed)
import { 
  fetchUserMealRecommendations, 
  applyMealRecommendation as applyRecommendationService, 
  dismissMealRecommendation as dismissRecommendationService,
  generateMealRecommendations as generateRecommendationsService
} from '@/services/recommendations/recommendationService';
import { submitMealRecommendationFeedback } from '@/services/recommendations/feedbackService';
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
      // Fetch meal recommendations for the user
      const data: MealType[] = await fetchUserMealRecommendations(user.id);
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

  const generateRecommendations = async () => {
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
        await generateRecommendationsService(user.id);
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

  const applyRecommendation = async (recommendationId: string) => {
    if (!user) return;
    try {
      await applyRecommendationService(recommendationId, user.id);

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

  const dismissRecommendation = async (recommendationId: string) => {
    if (!user) return;
    try {
      await dismissRecommendationService(recommendationId, user.id);

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
    feedbackType: string, // If you have a feedback type union, use it
    rating?: number,
    comments?: string
  ) => {
    if (!user) return;
    try {
      await submitMealRecommendationFeedback(user.id, recommendationId, feedbackType, rating, comments);

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
    generateRecommendations,
    applyRecommendation,
    dismissRecommendation,
    submitFeedback
  };
}

