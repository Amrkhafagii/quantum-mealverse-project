
import { supabase } from '@/integrations/supabase/client';
import { RatingStats } from '@/types/review';

// Get a meal's rating statistics for a specific restaurant
export const getMealRatingStats = async (mealId: string, restaurantId: string): Promise<RatingStats> => {
  const { data, error } = await supabase
    .from('meal_ratings')
    .select('avg_rating,review_count,rating_distribution')
    .match({ meal_id: mealId, restaurant_id: restaurantId })
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  
  if (data) {
    return {
      avg_rating: data.avg_rating,
      review_count: data.review_count,
      rating_distribution: data.rating_distribution as Record<number, number>
    };
  }
  
  return calculateRatingStats(mealId, restaurantId);
};

// Get a meal's global rating (across all restaurants)
export const getGlobalMealRating = async (mealId: string): Promise<RatingStats> => {
  const { data, error } = await supabase
    .from('global_meal_ratings')
    .select('avg_rating,review_count,rating_distribution')
    .eq('meal_id', mealId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  
  if (data) {
    return {
      avg_rating: data.avg_rating,
      review_count: data.review_count,
      rating_distribution: data.rating_distribution as Record<number, number>
    };
  }
  
  return calculateGlobalRatingStats(mealId);
};

// Helper function to calculate rating stats from reviews
const calculateRatingStats = async (mealId: string, restaurantId: string): Promise<RatingStats> => {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .match({
      meal_id: mealId,
      restaurant_id: restaurantId,
      status: 'approved'
    });
    
  return calculateStatsFromReviews(reviews || []);
};

const calculateGlobalRatingStats = async (mealId: string): Promise<RatingStats> => {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .match({
      meal_id: mealId,
      status: 'approved'
    });
    
  return calculateStatsFromReviews(reviews || []);
};

const calculateStatsFromReviews = (reviews: { rating: number }[]): RatingStats => {
  if (reviews.length === 0) {
    return {
      avg_rating: 0,
      review_count: 0,
      rating_distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    };
  }

  const distribution: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
  let sum = 0;
  
  reviews.forEach(review => {
    sum += review.rating;
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
  });
  
  return {
    avg_rating: sum / reviews.length,
    review_count: reviews.length,
    rating_distribution: distribution
  };
};

