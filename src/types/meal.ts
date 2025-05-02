
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
  nutritional_info?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    health_score?: number;
  };
  dietary_tags?: string[]; // Added for dietary preferences
  sustainability?: {
    carbon_footprint?: number; // Percentage reduction from average
    water_usage?: number; // Percentage reduction from average
    locally_sourced?: boolean;
    organic?: boolean;
  };
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
