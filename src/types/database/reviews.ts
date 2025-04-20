
export type ReviewsRow = {
  id: string;
  user_id: string;
  meal_id: string;
  restaurant_id: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  is_flagged: boolean;
  status: string;
};

export type ReviewsInsert = {
  user_id: string;
  meal_id: string;
  restaurant_id: string;
  rating: number;
  comment?: string | null;
  images?: string[] | null;
  is_verified_purchase: boolean;
  is_flagged: boolean;
  status: string;
};

export type ReviewsUpdate = {
  user_id?: string;
  meal_id?: string;
  restaurant_id?: string;
  rating?: number;
  comment?: string | null;
  images?: string[] | null;
  is_verified_purchase?: boolean;
  is_flagged?: boolean;
  status?: string;
};

export type ReviewsSelect = ReviewsRow;
