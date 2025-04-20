
export interface Review {
  id?: string;
  user_id: string;
  meal_id: string;
  restaurant_id: string;
  rating: number;
  comment?: string;
  images?: string[];
  is_verified_purchase: boolean;
  created_at?: string;
  updated_at?: string;
  is_flagged: boolean;
  status: ReviewStatus;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface RatingStats {
  avg_rating: number;
  review_count: number;
  rating_distribution: Record<number, number>;
}

export interface MealRating {
  meal_id: string;
  restaurant_id: string;
  avg_rating: number;
  review_count: number;
  rating_distribution: Record<number, number>;
  last_updated: string;
}

export interface GlobalMealRating {
  meal_id: string;
  avg_rating: number;
  review_count: number;
  rating_distribution: Record<number, number>;
  last_updated: string;
}
