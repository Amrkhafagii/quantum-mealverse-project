
export interface Menu {
  id: string;
  name: string;
  description?: string;
  price: number;
  restaurant_id: string;
  category?: string;
  image_url?: string;
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  is_available?: boolean;
  preparation_time?: number;
  ingredients?: string[];
  steps?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  restaurant_id: string;
  order?: number;
}

// Add missing MenuItem interface (alias for Menu)
export interface MenuItem extends Menu {
  created_at?: string;
  updated_at?: string;
}

// Add missing NutritionalInfo interface
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

// Add parseNutritionalInfo utility function
export function parseNutritionalInfo(nutritionalInfo: any): NutritionalInfo {
  if (!nutritionalInfo) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  }

  if (typeof nutritionalInfo === 'string') {
    try {
      return JSON.parse(nutritionalInfo);
    } catch {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }
  }

  return nutritionalInfo;
}

// Add calculateHealthScore utility function
export function calculateHealthScore(item: MenuItem): number {
  const nutritionalInfo = parseNutritionalInfo(item.nutritional_info);
  
  // Simple health score calculation based on nutritional content
  let score = 50; // Base score
  
  // Bonus for protein
  if (nutritionalInfo.protein && nutritionalInfo.protein > 10) {
    score += 10;
  }
  
  // Penalty for high calories
  if (nutritionalInfo.calories && nutritionalInfo.calories > 500) {
    score -= 10;
  }
  
  // Bonus for fiber
  if (nutritionalInfo.fiber && nutritionalInfo.fiber > 5) {
    score += 10;
  }
  
  // Penalty for high sodium
  if (nutritionalInfo.sodium && nutritionalInfo.sodium > 1000) {
    score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
}
