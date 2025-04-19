
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

// Default values for initializing a new meal
export const INITIAL_MEAL: MealType = {
  id: '',
  name: '',
  description: '',
  price: 0,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  restaurant_id: '',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  image_url: undefined
};
