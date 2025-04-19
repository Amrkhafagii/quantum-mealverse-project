
export interface MealType {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string | null;
  is_active: boolean;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}
