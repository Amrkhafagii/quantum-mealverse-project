
export interface MealCustomizationOption {
  id: string;
  meal_id: string;
  customization_type: 'ingredient_substitution' | 'dietary_modification' | 'portion_adjustment' | 'preparation_method';
  option_name: string;
  option_description?: string;
  price_adjustment: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IngredientSubstitution {
  id: string;
  original_ingredient: string;
  substitute_ingredient: string;
  substitution_reason?: string;
  price_adjustment: number;
  nutritional_impact?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sodium?: number;
    [key: string]: number | undefined;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealPlanCustomization {
  id: string;
  meal_plan_id: string;
  meal_id: string;
  user_id: string;
  servings_count: number;
  portion_size_multiplier: number;
  dietary_preferences: string[];
  ingredient_substitutions: IngredientSubstitution[];
  special_instructions?: string;
  total_price_adjustment: number;
  created_at: string;
  updated_at: string;
}

export interface CustomizedMeal {
  meal_id: string;
  name: string;
  base_price: number;
  servings_count: number;
  portion_size_multiplier: number;
  selected_substitutions: IngredientSubstitution[];
  selected_options: MealCustomizationOption[];
  special_instructions?: string;
  total_price: number;
  estimated_prep_time: number;
}

export interface MealCustomizationSummary {
  base_price: number;
  portion_adjustment: number;
  substitution_cost: number;
  option_cost: number;
  total_cost: number;
  nutritional_changes: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
}
