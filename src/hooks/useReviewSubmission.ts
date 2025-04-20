
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
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
      // Check for existing reviews - simplified query to avoid type issues
      const { data: existingReviews, error: checkError } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('meal_id', data.mealId)
        .eq('restaurant_id', data.restaurantId);
        
      if (checkError) throw checkError;
        
      if (existingReviews && existingReviews.length > 0) {
        toast.error('You have already reviewed this meal from this restaurant');
        return false;
      }
      
      // Check if user has purchased the meal - simplified query
      const { data: orders, error: orderError } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('meal_id', data.mealId)
        .eq('user_id', user.id);
        
      if (orderError) throw orderError;
      
      const isVerifiedPurchase = orders && orders.length > 0;
      
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
      
      // Insert the review
      const { error } = await supabase
        .from('reviews')
        .insert(review);
        
      if (error) throw error;
      
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
