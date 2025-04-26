
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
  ingredients?: string[];
  steps?: string[];
  quantity?: number; // Added for cart context
}

export const INITIAL_MEAL: MealType = {
  id: '',
  name: '',
  description: '',
  price: 0,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  image_url: null,
  is_active: true,
  restaurant_id: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ingredients: [],
  steps: []
};
