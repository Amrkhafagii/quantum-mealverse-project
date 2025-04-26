
import { Json } from './database';

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

export function parseNutritionalInfo(jsonInfo: Json): NutritionalInfo {
  // Safely parse nutritional info from JSON
  if (typeof jsonInfo === 'object' && jsonInfo !== null && !Array.isArray(jsonInfo)) {
    return {
      calories: Number(jsonInfo['calories'] || 0),
      protein: Number(jsonInfo['protein'] || 0),
      carbs: Number(jsonInfo['carbs'] || 0),
      fat: Number(jsonInfo['fat'] || 0),
      fiber: Number(jsonInfo['fiber'] || 0),
      sugar: Number(jsonInfo['sugar'] || 0),
      sodium: Number(jsonInfo['sodium'] || 0)
    };
  }
  
  // Return default nutritional info if parsing fails
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };
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
