
import { Json } from '@/types/database';
import { MealPlan, Meal, Food, MealFood } from '@/types/food';
import { SavedMealPlan } from '@/types/fitness';

// Common types used across meal plan services
export type MealDistribution = {
  name: string;
  protein: number;
  carbs: number;
  fat: number;
};

export type ActivityLevel = 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';

export interface TDEEResult {
  adjustedCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  goal: string;
  weight?: number;
  activityLevel?: string;
  [key: string]: any;
}
