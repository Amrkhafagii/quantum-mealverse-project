import { MealPlan } from './food';

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  date_created: string;
  tdee_id: string;
  meal_plan: MealPlan;
  expires_at?: string;  // New field for expiration date
  is_active?: boolean;  // New field to track if plan is active
}

// Add other fitness-related types here as needed
