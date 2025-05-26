
import { MealType } from "@/types/meal";

export const calculateNutritionalScore = (meal: MealType): number => {
  // Calculate a score based on nutritional balance (0-100)
  const nutritionalInfo = meal.nutritional_info;
  if (!nutritionalInfo) return 50; // Default score if no nutritional info
  
  let score = 50; // Base score
  
  // Protein score (higher is better, target ~25% of calories from protein)
  const proteinCalories = nutritionalInfo.protein * 4;
  const proteinRatio = proteinCalories / nutritionalInfo.calories;
  if (proteinRatio >= 0.20 && proteinRatio <= 0.35) {
    score += 15;
  } else if (proteinRatio >= 0.15) {
    score += 10;
  }
  
  // Moderate calorie content (not too high or too low)
  if (nutritionalInfo.calories >= 300 && nutritionalInfo.calories <= 600) {
    score += 10;
  } else if (nutritionalInfo.calories >= 200 && nutritionalInfo.calories <= 800) {
    score += 5;
  }
  
  // Lower sugar content is better
  if (nutritionalInfo.sugar && nutritionalInfo.sugar < 10) {
    score += 10;
  } else if (nutritionalInfo.sugar && nutritionalInfo.sugar < 20) {
    score += 5;
  }
  
  // Lower sodium content is better
  if (nutritionalInfo.sodium && nutritionalInfo.sodium < 600) {
    score += 10;
  } else if (nutritionalInfo.sodium && nutritionalInfo.sodium < 1000) {
    score += 5;
  }
  
  // Fat balance (not too high, not too low)
  const fatCalories = nutritionalInfo.fat * 9;
  const fatRatio = fatCalories / nutritionalInfo.calories;
  if (fatRatio >= 0.20 && fatRatio <= 0.35) {
    score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
};

export const sortMealsByNutrition = (meals: MealType[]): MealType[] => {
  return meals.sort((a, b) => {
    const scoreA = calculateNutritionalScore(a);
    const scoreB = calculateNutritionalScore(b);
    return scoreB - scoreA; // Higher scores first
  });
};

export const filterMealsByDietaryTags = (meals: MealType[], tags: string[]): MealType[] => {
  if (tags.length === 0) return meals;
  
  return meals.filter(meal => {
    if (!meal.dietary_tags) return false;
    return tags.some(tag => 
      meal.dietary_tags?.some(dietaryTag => 
        typeof dietaryTag === 'string' ? dietaryTag === tag : dietaryTag.name === tag
      )
    );
  });
};

export const groupMealsByCategory = (meals: MealType[]): { [key: string]: MealType[] } => {
  const groups: { [key: string]: MealType[] } = {};
  
  meals.forEach(meal => {
    // Simple categorization based on meal name and dietary tags
    let category = 'Main Dishes';
    
    const name = meal.name.toLowerCase();
    const dietary_tags = meal.dietary_tags || [];
    
    if (name.includes('salad') || dietary_tags.some(tag => 
      typeof tag === 'string' ? tag.includes('fresh') : tag.name?.includes('fresh')
    )) {
      category = 'Salads & Fresh';
    } else if (name.includes('soup') || name.includes('broth')) {
      category = 'Soups';
    } else if (name.includes('dessert') || name.includes('cake') || name.includes('ice cream')) {
      category = 'Desserts';
    } else if (name.includes('drink') || name.includes('juice') || name.includes('smoothie')) {
      category = 'Beverages';
    } else if (dietary_tags.some(tag => 
      typeof tag === 'string' ? tag.includes('vegan') || tag.includes('vegetarian') : 
      tag.name?.includes('vegan') || tag.name?.includes('vegetarian')
    )) {
      category = 'Plant-Based';
    }
    
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(meal);
  });
  
  return groups;
};
