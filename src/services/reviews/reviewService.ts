
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types/review';

// Submit a new review
export const submitReview = async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
  // Check for duplicate reviews from the same user for the same meal/restaurant
  const { data: existingReviews } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', review.user_id)
    .eq('meal_id', review.meal_id)
    .eq('restaurant_id', review.restaurant_id);
    
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
  
  // Trigger a background update of the rating caches
  try {
    // Update restaurant-specific ratings
    await supabase.rpc('update_meal_rating_cache', {
      p_meal_id: review.meal_id,
      p_restaurant_id: review.restaurant_id
    });
    
    // Update global ratings
    await supabase.rpc('update_global_meal_rating_cache', {
      p_meal_id: review.meal_id
    });
  } catch (error) {
    console.error('Error updating rating cache:', error);
    // Don't throw here - we don't want to fail the review submission
  }
  
  return data;
};

// Get a specific meal's reviews for a specific restaurant
export const getMealReviews = async (mealId: string, restaurantId: string, page = 1, limit = 10) => {
  // Calculate pagination ranges
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  // Simplified query to avoid type issues
  const { data, error, count } = await supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .eq('meal_id', mealId)
    .eq('restaurant_id', restaurantId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(from, to);
    
  if (error) throw error;
  
  return { 
    reviews: data as Review[], 
    total: count || 0,
    page,
    pages: count ? Math.ceil(count / limit) : 0
  };
};

// Get a meal's rating statistics for a specific restaurant
export const getMealRatingStats = async (mealId: string, restaurantId: string) => {
  // First try to get from cached ratings - simplified query
  const { data, error } = await supabase
    .from('meal_ratings')
    .select('*')
    .eq('meal_id', mealId)
    .eq('restaurant_id', restaurantId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // Not found error is okay
    throw error;
  }
  
  if (data) {
    return {
      avg_rating: data.avg_rating,
      review_count: data.review_count,
      rating_distribution: data.rating_distribution || {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    };
  }
  
  // If no cached ratings exist yet, calculate from reviews - simplified query
  const { data: reviewsData, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('meal_id', mealId)
    .eq('restaurant_id', restaurantId)
    .eq('status', 'approved');
    
  if (reviewsError) throw reviewsError;
  
  if (reviewsData && reviewsData.length > 0) {
    const distribution: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    let sum = 0;
    
    reviewsData.forEach(review => {
      const rating = review.rating;
      sum += rating;
      distribution[rating] = (distribution[rating] || 0) + 1;
    });
    
    return {
      avg_rating: sum / reviewsData.length,
      review_count: reviewsData.length,
      rating_distribution: distribution
    };
  }
  
  // No reviews
  return {
    avg_rating: 0,
    review_count: 0,
    rating_distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
  };
};

// Get a meal's global rating (across all restaurants)
export const getGlobalMealRating = async (mealId: string) => {
  // Simplified query to avoid type issues
  const { data, error } = await supabase
    .from('global_meal_ratings')
    .select('avg_rating, review_count, rating_distribution')
    .eq('meal_id', mealId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // Not found error is okay
    throw error;
  }
  
  if (data) {
    return {
      avg_rating: data.avg_rating,
      review_count: data.review_count,
      rating_distribution: data.rating_distribution || {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    };
  }
  
  // Calculate on the fly if no cached data - simplified query
  const { data: reviewsData, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('meal_id', mealId)
    .eq('status', 'approved');
    
  if (reviewsError) throw reviewsError;
  
  if (reviewsData && reviewsData.length > 0) {
    const distribution: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    let sum = 0;
    
    reviewsData.forEach(review => {
      const rating = review.rating;
      sum += rating;
      distribution[rating] = (distribution[rating] || 0) + 1;
    });
    
    return {
      avg_rating: sum / reviewsData.length,
      review_count: reviewsData.length,
      rating_distribution: distribution
    };
  }
  
  // No reviews
  return {
    avg_rating: 0,
    review_count: 0,
    rating_distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
  };
};

// Flag a review for moderation
export const flagReview = async (reviewId: string) => {
  const { error } = await supabase
    .from('reviews')
    .update({ is_flagged: true })
    .eq('id', reviewId);
    
  if (error) throw error;
  
  return true;
};

// Check if a user has already reviewed a meal at a specific restaurant
export const hasUserReviewed = async (userId: string, mealId: string, restaurantId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', userId)
    .eq('meal_id', mealId)
    .eq('restaurant_id', restaurantId);
    
  if (error) throw error;
  
  return data && data.length > 0;
};

// Check if a user has ordered this meal from this restaurant (for verified purchase badge)
export const hasUserPurchased = async (userId: string, mealId: string, restaurantId: string) => {
  const { data, error } = await supabase
    .from('order_items')
    .select('id')
    .eq('user_id', userId)
    .eq('meal_id', mealId)
    .eq('restaurant_id', restaurantId);
    
  if (error) throw error;
  
  return data && data.length > 0;
};
