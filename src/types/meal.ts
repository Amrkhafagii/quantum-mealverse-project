
export interface MealType {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_active: boolean;
  restaurant_id?: string;
  created_at?: string;
  updated_at?: string;
  dietary_tags?: string[];
  allergen_warnings?: string[];
  preparation_time?: number;
  complexity_level?: string;
  cooking_instructions?: any[];
  totalTime?: number; // Computed property for total preparation time
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_active: boolean;
  restaurant_id?: string;
  created_at?: string;
  updated_at?: string;
  dietary_tags?: string[];
  allergen_warnings?: string[];
  preparation_time?: number;
  complexity_level?: string;
  cooking_instructions?: any[];
  totalTime?: number;
  foods?: MealFood[];
}

export interface MealFood {
  food: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  portionSize: number;
}

export const INITIAL_MEAL: MealType = {
  id: '',
  name: '',
  description: '',
  image_url: '',
  price: 0,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  is_active: true,
  dietary_tags: [],
  allergen_warnings: [],
  preparation_time: 30,
  complexity_level: 'simple',
  cooking_instructions: [],
  totalTime: 30
};
