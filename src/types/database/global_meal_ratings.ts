
import { Json } from './helpers';

export type GlobalMealRatingsRow = {
  meal_id: string;
  avg_rating: number;
  review_count: number;
  rating_distribution: Json | null;
  last_updated: string;
};

export type GlobalMealRatingsInsert = {
  meal_id: string;
  avg_rating: number;
  review_count: number;
  rating_distribution?: Json | null;
  last_updated: string;
};

export type GlobalMealRatingsUpdate = {
  meal_id?: string;
  avg_rating?: number;
  review_count?: number;
  rating_distribution?: Json | null;
  last_updated?: string;
};

export type GlobalMealRatingsSelect = GlobalMealRatingsRow;
