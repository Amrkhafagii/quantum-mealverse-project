
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types/review';

// Submit a new review
export const submitReview = async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
  // Check for duplicate reviews from the same user for the same meal/restaurant
  const { data: existingReviews } = await supabase
    .from('reviews')
    .select('id')
    .match({
      user_id: review.user_id,
      meal_id: review.meal_id,
      restaurant_id: review.restaurant_id
    });
    
  if (existingReviews && existingReviews.length > 0) {
    throw new Error('You have already reviewed this meal from this restaurant');
  }
  
  // Add the review
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
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

