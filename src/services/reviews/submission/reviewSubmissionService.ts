
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types/review';

interface ReviewCheck {
  id: string;
}

export const submitReview = async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
  // Check for duplicate reviews
  const { data: existingReviews, error: checkError } = await supabase
    .from('reviews')
    .select('id')
    .match({
      reviews_user_id: review.user_id,
      meal_id: review.meal_id,
      restaurant_id: review.restaurant_id
    })
    .limit(1);
    
  if (checkError) throw checkError;
  
  if (existingReviews && existingReviews.length > 0) {
    throw new Error('You have already reviewed this meal from this restaurant');
  }
  
  // Map interface fields to database fields
  const dbReview = {
    reviews_user_id: review.user_id,
    meal_id: review.meal_id,
    restaurant_id: review.restaurant_id,
    rating: review.rating,
    comment: review.comment,
    images: review.images,
    status: review.status,
    is_flagged: review.is_flagged,
    is_verified_purchase: review.is_verified_purchase
  };
  
  // Add the review
  const { data, error } = await supabase
    .from('reviews')
    .insert(dbReview)
    .select()
    .single();
    
  if (error) throw error;
  
  // Trigger background updates
  await updateRatingCaches(review.meal_id, review.restaurant_id);
  
  return data;
};

// Helper function to update rating caches
const updateRatingCaches = async (mealId: string, restaurantId: string) => {
  try {
    await supabase.rpc('update_meal_rating_cache', {
      p_meal_id: mealId,
      p_restaurant_id: restaurantId
    });
    
    await supabase.rpc('update_global_meal_rating_cache', {
      p_meal_id: mealId
    });
  } catch (error) {
    console.error('Error updating rating cache:', error);
  }
};
