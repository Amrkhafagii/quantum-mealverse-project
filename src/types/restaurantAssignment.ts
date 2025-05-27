
export interface RestaurantFoodCapability {
  id: string;
  restaurant_id: string;
  food_item_id: string;
  is_available: boolean;
  preparation_time_minutes: number;
  minimum_quantity_grams: number;
  maximum_quantity_grams: number;
  created_at: string;
  updated_at: string;
}

export interface MealPlanRestaurantAssignment {
  id: string;
  meal_plan_id: string;
  restaurant_assignments: RestaurantAssignmentDetail[];
  total_price: number;
  assignment_strategy: 'single_restaurant' | 'multi_restaurant' | 'cheapest';
  created_at: string;
  updated_at: string;
}

export interface RestaurantAssignmentDetail {
  restaurant_id: string;
  restaurant_name: string;
  food_items: MealFoodItem[];
  subtotal: number;
  estimated_prep_time?: number;
  distance_km?: number;
}

export interface MealFoodItem {
  food_name: string;
  quantity: number;
  unit?: string;
  price_per_unit?: number;
  total_price?: number;
}

export interface CapableRestaurant {
  restaurant_id: string;
  restaurant_name: string;
  distance_km: number;
  estimated_prep_time: number;
  can_prepare_complete_meal: boolean;
}

export interface MultiRestaurantAssignmentResult {
  assignments: RestaurantAssignmentDetail[];
  total_price: number;
  strategy: string;
}

export interface RestaurantAssignmentOptions {
  strategy?: 'single_restaurant' | 'multi_restaurant' | 'cheapest';
  max_distance_km?: number;
  customer_latitude?: number;
  customer_longitude?: number;
  prefer_single_restaurant?: boolean;
}
