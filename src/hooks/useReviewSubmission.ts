
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { submitReview as submitReviewService } from '@/services/reviews/submission/reviewSubmissionService';
import { hasUserReviewed } from '@/services/reviews/moderation/reviewModerationService';

export interface ReviewSubmissionData {
  rating: number;
  comment?: string;
  images?: string[];
  mealId: string;
  restaurantId: string;
}

export const useReviewSubmission = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = async (data: ReviewSubmissionData) => {
    if (!user) {
      toast.error('You must be logged in to submit a review');
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check for existing reviews using our service function
      const hasReviewed = await hasUserReviewed(user.id, data.mealId, data.restaurantId);
        
      if (hasReviewed) {
        toast.error('You have already reviewed this meal from this restaurant');
        return false;
      }
      
      // Check if user has purchased the meal - simplified query
      const { count, error: orderError } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .eq('meal_id', data.mealId)
        .eq('user_id', user.id);
        
      if (orderError) throw orderError;
      
      const isVerifiedPurchase = Boolean(count && count > 0);
      
      // Create review object
      const review = {
        user_id: user.id,
        meal_id: data.mealId,
        restaurant_id: data.restaurantId,
        rating: data.rating,
        comment: data.comment,
        images: data.images,
        is_verified_purchase: isVerifiedPurchase,
        status: 'pending' as const
      };
      
      // Use the service to submit the review
      await submitReviewService(review);
      
      toast.success('Review submitted successfully!');
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitReview,
    isSubmitting
  };
};
