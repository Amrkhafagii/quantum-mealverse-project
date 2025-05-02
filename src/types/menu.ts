
import { Json } from './database';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  category: string;
  preparation_time: number;
  ingredients?: string[];
  steps?: string[];
  nutritional_info?: NutritionalInfo;
  created_at?: string;
  updated_at?: string;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  allergens?: string[];
  health_score?: number;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  order?: number;
}

/**
 * Safely parses the nutritional_info object from database JSON
 */
export const parseNutritionalInfo = (data: Json | null | undefined): NutritionalInfo => {
  if (!data) return {};
  
  // If it's already the correct type, return it
  if (typeof data === 'object' && data !== null) {
    return data as NutritionalInfo;
  }
  
  // Return empty object as fallback
  return {};
};

/**
 * Calculates health score based on nutritional information
 * A simple algorithm that weighs protein higher and penalizes excessive sugar
 */
export const calculateHealthScore = (info: NutritionalInfo): number => {
  const calories = info.calories || 0;
  const protein = info.protein || 0;
  const carbs = info.carbs || 0;
  const fat = info.fat || 0;
  const fiber = info.fiber || 0;
  const sugar = info.sugar || 0;
  
  if (calories === 0) return 0;
  
  // Simple scoring algorithm - can be enhanced later
  let score = 0;
  
  // Protein is good (weight it higher)
  score += (protein * 2);
  
  // Fiber is good
  score += (fiber * 1.5);
  
  // Too much sugar is bad
  score -= (sugar * 0.5);
  
  // Normalize by calories (per 100 calories)
  score = (score / calories) * 100;
  
  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));
  
  return Math.round(score);
};
