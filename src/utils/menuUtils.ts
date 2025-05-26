
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
    return tags.some(tag => {
      return meal.dietary_tags?.some(dietaryTag => {
        if (typeof dietaryTag === 'string') {
          return dietaryTag === tag;
        } else if (dietaryTag && typeof dietaryTag === 'object' && 'name' in dietaryTag) {
          return dietaryTag.name === tag;
        }
        return false;
      });
    });
  });
};

export const groupMealsByCategory = (meals: MealType[]): { [key: string]: MealType[] } => {
  const groups: { [key: string]: MealType[] } = {};
  
  meals.forEach(meal => {
    // Simple categorization based on meal name and dietary tags
    let category = 'Main Dishes';
    
    const name = meal.name.toLowerCase();
    const dietary_tags = meal.dietary_tags || [];
    
    if (name.includes('salad')) {
      category = 'Salads & Fresh';
    } else if (name.includes('soup') || name.includes('broth')) {
      category = 'Soups';
    } else if (name.includes('dessert') || name.includes('cake') || name.includes('ice cream')) {
      category = 'Desserts';
    } else if (name.includes('drink') || name.includes('juice') || name.includes('smoothie')) {
      category = 'Beverages';
    } else if (dietary_tags.some(tag => {
      if (typeof tag === 'string') {
        return tag.includes('vegan') || tag.includes('vegetarian');
      } else if (tag && typeof tag === 'object' && 'name' in tag) {
        return tag.name?.includes('vegan') || tag.name?.includes('vegetarian');
      }
      return false;
    })) {
      category = 'Plant-Based';
    }
    
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(meal);
  });
  
  return groups;
};

// Add missing functions that RestaurantMealMatcher expects
export const calculateMatchPercentage = (
  targetMacros: { calories: number; protein: number; carbs: number; fat: number },
  itemMacros: { calories: number; protein: number; carbs: number; fat: number }
): number => {
  // Calculate percentage match based on macro similarity
  const caloriesDiff = Math.abs(targetMacros.calories - itemMacros.calories) / targetMacros.calories;
  const proteinDiff = Math.abs(targetMacros.protein - itemMacros.protein) / targetMacros.protein;
  const carbsDiff = Math.abs(targetMacros.carbs - itemMacros.carbs) / targetMacros.carbs;
  const fatDiff = Math.abs(targetMacros.fat - itemMacros.fat) / targetMacros.fat;
  
  // Weight the differences (calories more important)
  const avgDiff = (caloriesDiff * 0.4 + proteinDiff * 0.2 + carbsDiff * 0.2 + fatDiff * 0.2);
  
  // Convert to percentage match (100% - difference percentage)
  return Math.max(0, Math.min(100, (1 - avgDiff) * 100));
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};
