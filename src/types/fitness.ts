import { MealPlan } from './food';

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  date_created: string;
  meal_plan: MealPlan;
  tdee_id: string;
  expires_at: string;  // Added missing field
  is_active: boolean;  // Added missing field
}
