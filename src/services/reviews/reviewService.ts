
import { supabase } from '@/integrations/supabase/client';
import type { RestaurantReview } from '@/types/notifications';

// Define MealRating interface locally since it's not in types/notifications
interface MealRating {
  meal_id: string;
  restaurant_id: string;
  avg_rating: number;
  review_count: number;
  rating_distribution: Record<string, number>;
  last_updated: string;
}

export class ReviewService {
  // Get reviews for a restaurant
  async getRestaurantReviews(restaurantId: string, limit = 20): Promise<RestaurantReview[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(review => ({
      ...review,
      user_id: review.reviews_user_id,
      status: review.status as RestaurantReview['status'],
      comment: review.comment || '',
      images: review.images || [],
      meal_id: review.meal_id || '',
      order_id: undefined // This field doesn't exist in the reviews table
    }));
  }

  // Get meal ratings for restaurant menu items
  async getMealRatings(restaurantId: string): Promise<MealRating[]> {
    const { data, error } = await supabase
      .from('meal_ratings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('avg_rating', { ascending: false });

    if (error) throw error;
    return (data || []).map(rating => ({
      ...rating,
      rating_distribution: this.parseRatingDistribution(rating.rating_distribution)
    }));
  }

  // Helper function to parse rating distribution from JSON
  private parseRatingDistribution(distribution: any): Record<string, number> {
    if (typeof distribution === 'object' && distribution !== null) {
      return distribution;
    }
    if (typeof distribution === 'string') {
      try {
        return JSON.parse(distribution);
      } catch {
        return { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      }
    }
    return { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  }

  // Get restaurant average rating
  async getRestaurantAverageRating(restaurantId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'approved');

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
      };
    }

    const totalReviews = data.length;
    const averageRating = data.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingDistribution = data.reduce((dist, review) => {
      dist[review.rating.toString()] = (dist[review.rating.toString()] || 0) + 1;
      return dist;
    }, { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 });

    return {
      averageRating: Number(averageRating.toFixed(2)),
      totalReviews,
      ratingDistribution
    };
  }

  // Flag a review for moderation
  async flagReview(reviewId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .update({ 
        is_flagged: true,
        status: 'pending'
      })
      .eq('id', reviewId);

    if (error) throw error;
  }

  // Respond to a review (if system supports it)
  async respondToReview(reviewId: string, response: string): Promise<void> {
    // This would require additional table structure for review responses
    // For now, we'll update the review metadata
    const { error } = await supabase
      .from('reviews')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (error) throw error;
  }
}

export const reviewService = new ReviewService();
