
export interface Meal {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  category?: string;
  is_available?: boolean;
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    allergens?: string[];
    health_score?: number;
  };
  preparation_time?: number;
  ingredients?: string[];
  steps?: string[];
  restaurant_id?: string;
}
