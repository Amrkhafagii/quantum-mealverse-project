
import { Json } from './database';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  nutritional_info?: NutritionalInfo;
  is_available: boolean;
  preparation_time: number;
  created_at?: string;
  updated_at?: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  health_score?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  restaurant_id: string;
  order?: number;
}

export const calculateHealthScore = (info: NutritionalInfo): number => {
  // Simple scoring algorithm - can be expanded upon
  let score = 70; // Base score
  
  // Protein is good
  score += info.protein * 0.5;
  
  // Sugar and sodium reduce score
  score -= (info.sugar || 0) * 0.3;
  score -= (info.sodium || 0) * 0.01;
  
  // Fiber improves score
  score += (info.fiber || 0) * 0.7;
  
  // Cap between 0-100
  return Math.max(0, Math.min(100, score));
};
