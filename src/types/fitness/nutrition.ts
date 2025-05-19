
import { HydrationData } from './index';

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  date_created: string;
  expiration_date?: string;
  meal_plan: any; // This contains the full meal plan data
  tdee_id?: string;
  hydration_data?: HydrationData;
}

export interface NutritionGoal {
  id: string;
  user_id: string;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  calorie_target: number;
  hydration_target: number;
  created_at: string;
  updated_at: string;
}

export interface DailyNutritionLog {
  id: string;
  user_id: string;
  date: string;
  meals: any[];
  water_intake: number;
  calories_consumed: number;
  protein_consumed: number;
  carbs_consumed: number;
  fat_consumed: number;
  notes?: string;
}
