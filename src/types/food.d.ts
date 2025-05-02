
export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  // Extended properties
  serving_size?: string;
  unit?: string;
  allergies?: string[];
}

export interface MealFood extends Food {
  serving_size: string;
  unit: string;
  servings?: number;
}

export interface Meal {
  id?: string;
  name: string;
  description?: string;
  foods: MealFood[];
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
}

export interface MealPlan {
  id?: string;
  user_id?: string;
  name?: string;
  date_created?: string;
  meals: Meal[];
  totalCalories?: number;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  dietary_type?: string;
  calorie_target?: number;
}

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  date_created: string;
  meal_plan: MealPlan;
  tdee_id?: string;
}

export interface DietaryPreference {
  id: string;
  name: string;
  description?: string;
}

export interface DietaryRestriction {
  id: string;
  name: string;
  description?: string;
}
