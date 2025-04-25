
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { submitReview as submitReviewService } from '@/services/reviews/submission/reviewSubmissionService';
import { hasUserReviewed } from '@/services/reviews/moderation/reviewModerationService';
import { verifyPurchaseWithDetails, canReviewBasedOnTimeline, generateVerificationHash } from '@/services/reviews/verification/enhancedVerificationService';
import { Review } from '@/types/review';

export interface EnhancedReviewSubmissionData {
  rating: number;
  comment?: string;
  images?: string[];
  mealId: string;
  restaurantId: string;
  reviewMetadata?: {
    experienceTime?: number;   // How long user interacted with review form in seconds
    deviceInfo?: string;       // Basic device info for fraud detection
    aiContentScore?: number;   // Reserved for AI content analysis score
  };
}

export interface VerificationStatus {
  isVerified: boolean;
  canReview: boolean;
  waitTimeHours?: number;
  purchaseCount?: number;
  orderDate?: string;
  deliveryDate?: string;
}

export const useEnhancedReviewSubmission = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);

  // Check verification status before allowing the review
  const checkVerificationStatus = async (mealId: string): Promise<VerificationStatus> => {
    if (!user) {
      return {
        isVerified: false,
        canReview: false
      };
    }

    const verificationResult = await verifyPurchaseWithDetails(user.id, mealId);
    const canReview = canReviewBasedOnTimeline(verificationResult);
    
    const status: VerificationStatus = {
      isVerified: verificationResult.isVerified,
      canReview,
      purchaseCount: verificationResult.mealData?.purchaseCount,
      orderDate: verificationResult.orderData?.orderDate,
      deliveryDate: verificationResult.orderData?.deliveryDate
    };

    // If we can't review yet, calculate wait time
    if (verificationResult.isVerified && !canReview && 
        verificationResult.orderData?.timeSinceDelivery !== undefined) {
      status.waitTimeHours = 24 - verificationResult.orderData.timeSinceDelivery;
    }

    setVerificationStatus(status);
    return status;
  };

  const submitReview = async (data: EnhancedReviewSubmissionData) => {
    if (!user) {
      toast.error('You must be logged in to submit a review');
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      // First, check if the user has already reviewed this meal
      const hasReviewed = await hasUserReviewed(user.id, data.mealId, data.restaurantId);
        
      if (hasReviewed) {
        toast.error('You have already reviewed this meal from this restaurant');
        return false;
      }
      
      // Get enhanced verification with timeline details
      const verificationResult = await verifyPurchaseWithDetails(user.id, data.mealId);
      
      // Check if enough time has passed since delivery to leave a review
      if (verificationResult.isVerified && !canReviewBasedOnTimeline(verificationResult)) {
        const waitTimeHours = verificationResult.orderData?.timeSinceDelivery 
          ? 24 - verificationResult.orderData.timeSinceDelivery : 24;
          
        toast.error(`Please wait ${waitTimeHours} more hours before reviewing. We want to ensure you've had time to experience the meal.`);
        return false;
      }
      
      // Create a verification hash for this review-order pairing
      let verificationHash = '';
      if (verificationResult.isVerified && verificationResult.orderData?.orderId) {
        verificationHash = generateVerificationHash(
          user.id, 
          data.mealId, 
          verificationResult.orderData.orderId
        );
      }
      
      // Prepare review data
      const review: Omit<Review, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        meal_id: data.mealId,
        restaurant_id: data.restaurantId,
        rating: data.rating,
        comment: data.comment,
        images: data.images,
        is_verified_purchase: verificationResult.isVerified,
        status: 'pending',
        is_flagged: false
      };
      
      // Submit the review
      await submitReviewService(review);
      
      // If verified, also store the metadata
      if (verificationResult.isVerified && verificationResult.orderData?.orderId) {
        await supabase.from('review_metadata').insert({
          review_user_id: user.id,
          review_meal_id: data.mealId,
          verification_hash: verificationHash,
          order_id: verificationResult.orderData.orderId,
          order_date: verificationResult.orderData.orderDate,
          delivery_date: verificationResult.orderData.deliveryDate,
          experience_time: data.reviewMetadata?.experienceTime || 0,
          device_info: data.reviewMetadata?.deviceInfo || navigator.userAgent,
          ai_content_score: data.reviewMetadata?.aiContentScore
        });
      }
      
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
    checkVerificationStatus,
    verificationStatus,
    isSubmitting
  };
};
