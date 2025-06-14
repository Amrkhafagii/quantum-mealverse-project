
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { MealType } from '@/types/meal';

import {
  fetchUserRecommendations,
  applyRecommendation,
  dismissRecommendation,
  generateRecommendations,
} from '@/services/recommendations/recommendationService';
import { submitRecommendationFeedback } from '@/services/recommendations/feedbackService';
import { IntelligentRecommendationEngine } from '@/services/recommendations/intelligentRecommendationEngine';

// The type for feedback -- restrict to the union as required
type FeedbackOption = "positive" | "negative" | "neutral";

export function useRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<MealType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchRecommendations = async (): Promise<void> => {
    if (!user) return;
    try {
      setIsLoading(true);
      // Hotfix: Map WorkoutRecommendation to minimal MealType
      const workoutRecs: any[] = await fetchUserRecommendations(user.id);
      // If shape is correct, use directly, else map minimal
      const asMeals: MealType[] = (workoutRecs || []).map((item: any) => ({
        id: item.id || '',
        name: item.name || item.title || 'Recommended Meal',
        description: item.description || '',
        image_url: item.image_url || '',
        price: item.price ?? 0,
        calories: item.calories ?? 0,
        protein: item.protein ?? 0,
        carbs: item.carbs ?? 0,
        fat: item.fat ?? 0,
        is_active: item.is_active ?? true,
        restaurant_id: item.restaurant_id || '',
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
        dietary_tags: item.dietary_tags ?? [],
        allergen_warnings: item.allergen_warnings ?? [],
        preparation_time: item.preparation_time ?? 30,
        complexity_level: item.complexity_level ?? 'simple',
        cooking_instructions: item.cooking_instructions ?? [],
        totalTime: item.totalTime ?? 30,
      }));
      setRecommendations(asMeals);
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
    feedbackType: FeedbackOption,
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
