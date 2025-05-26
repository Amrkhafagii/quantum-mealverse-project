
export interface FoodItem {
  id: string;
  name: string;
  category: string;
  base_unit: string;
  nutritional_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface FoodItemPrice {
  id: string;
  food_item_id: string;
  restaurant_id: string;
  price_per_unit: number;
  minimum_order_quantity?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FoodPricingQuery {
  food_item_id: string;
  food_name: string;
  restaurant_id: string;
  restaurant_name: string;
  price_per_unit: number;
  total_price: number;
  base_unit: string;
  nutritional_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface MealFoodWithPricing {
  food_name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_price: number;
  nutritional_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface MealPricingResult {
  total_price: number;
  foods: MealFoodWithPricing[];
  restaurant_id: string;
  restaurant_name: string;
}
