
import { Json } from './helpers';

export type MealRatingsRow = {
  meal_id: string;
  restaurant_id: string;
  avg_rating: number;
  review_count: number;
  rating_distribution: Json | null;
  last_updated: string;
};

export type MealRatingsInsert = {
  meal_id: string;
  restaurant_id: string;
  avg_rating: number;
  review_count: number;
  rating_distribution?: Json | null;
  last_updated: string;
};

export type MealRatingsUpdate = {
  meal_id?: string;
  restaurant_id?: string;
  avg_rating?: number;
  review_count?: number;
  rating_distribution?: Json | null;
  last_updated?: string;
};

export type MealRatingsSelect = MealRatingsRow;
