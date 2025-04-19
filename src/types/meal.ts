
export interface MealType {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  restaurant_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image_url?: string;
}
