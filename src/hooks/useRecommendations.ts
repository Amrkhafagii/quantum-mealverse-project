
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WorkoutRecommendation, RecommendationFeedback } from '@/types/fitness/recommendations';
import { 
  fetchUserRecommendations, 
  applyRecommendation as applyRecommendationService, 
  dismissRecommendation as dismissRecommendationService,
  generateRecommendations as generateRecommendationsService
} from '@/services/recommendations/recommendationService';
import { submitRecommendationFeedback } from '@/services/recommendations/feedbackService';
import { IntelligentRecommendationEngine } from '@/services/recommendations/intelligentRecommendationEngine';

export function useRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchRecommendations = async (): Promise<void> => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data: WorkoutRecommendation[] = await fetchUserRecommendations(user.id);
      setRecommendations(data);
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
      await IntelligentRecommendationEngine.generatePersonalizedRecommendations(user.id);

      toast({
        title: "Success",
        description: "New personalized recommendations generated!",
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
    if (!user) return;
    try {
      await dismissRecommendationService(recommendationId, user.id);

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
      await submitRecommendationFeedback(user.id, recommendationId, feedbackType, rating, comments);

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
