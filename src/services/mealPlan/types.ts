
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

// This is a local extension to ensure our services have the right type definition
// without modifying the base type in fitness types
export interface SavedMealPlanExtended extends SavedMealPlan {
  is_active: boolean;
  expires_at?: string;
}

// New nutrition-focused types
export interface NutrientConversion {
  factor: number;
  description: string;
}

export interface CookingConversion {
  raw_to_cooked: {
    [foodType: string]: {
      [method: string]: number;
    };
  };
  cooked_to_raw: {
    [foodType: string]: {
      [method: string]: number;
    };
  };
}

export interface MealNutrientTargets {
  name: string;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetCalories: number;
}

export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  factor: number;
}
