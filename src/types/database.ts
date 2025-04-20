export type ReviewStatus = 'pending' | 'approved' | 'rejected';

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

// Add the Database type with tables interface
export interface Database {
  order_items: {
    Row: {
      id: string;
      order_id: string;
      meal_id: string;
      quantity: number;
      price: number;
      name: string;
      created_at: string;
      user_id?: string;
    };
    Insert: Omit<Database['order_items']['Row'], 'id' | 'created_at'>;
    Update: Partial<Database['order_items']['Row']>;
  };
}

export interface Tables {
  reviews: {
    Row: {
      id: string;
      user_id: string;
      meal_id: string;
      restaurant_id: string;
      rating: number;
      comment?: string;
      images?: string[];
      is_verified_purchase: boolean;
      created_at: string;
      updated_at: string;
      is_flagged: boolean;
      status: ReviewStatus;
    };
    Insert: Omit<Tables['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Tables['reviews']['Row']>;
  };
  meal_ratings: {
    Row: MealRating;
    Insert: MealRating;
    Update: Partial<MealRating>;
  };
  global_meal_ratings: {
    Row: GlobalMealRating;
    Insert: GlobalMealRating;
    Update: Partial<GlobalMealRating>;
  };
}
