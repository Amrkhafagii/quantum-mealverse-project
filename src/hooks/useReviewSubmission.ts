import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { submitReview as submitReviewService } from '@/services/reviews/submission/reviewSubmissionService';
import { hasUserReviewed } from '@/services/reviews/moderation/reviewModerationService';
import { checkVerifiedPurchase } from '@/services/reviews/verification/purchaseVerificationService';
import { Review } from '@/types/review';

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
      // All review calls should use {table}_user_id fields
      const hasReviewed = await hasUserReviewed(user.id, data.mealId, data.restaurantId);
        
      if (hasReviewed) {
        toast.error('You have already reviewed this meal from this restaurant');
        return false;
      }
      const isVerifiedPurchase = await checkVerifiedPurchase(user.id, data.mealId);

      const review: Omit<Review, 'id' | 'created_at' | 'updated_at'> = {
        reviews_user_id: user.id, // use reviews_user_id not user_id
        meal_id: data.mealId,
        restaurant_id: data.restaurantId,
        rating: data.rating,
        comment: data.comment,
        images: data.images,
        is_verified_purchase: isVerifiedPurchase,
        status: 'pending',
        is_flagged: false
      };
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
