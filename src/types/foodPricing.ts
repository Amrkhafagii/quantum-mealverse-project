
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
  price_per_base_portion: number;
  base_portion_size: number;
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
  base_price: number;
  calculated_price: number;
  portion_size: number;
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

export interface DynamicPricing {
  base_price: number;
  base_portion: number;
  requested_portion: number;
  calculated_price: number;
  price_per_unit: number;
}
