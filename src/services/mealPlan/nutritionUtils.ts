
import { MealPlan, Food, CookingState } from '@/types/food';
import { foodDataService, FoodItem } from '../foodDataService';
import { MealDistribution } from './types';

/**
 * Converts nutrition measurements based on cooking method
 */
export const convertBasedOnCookingMethod = (
  food: Food, 
  portionSize: number,
  fromCookingState: 'raw' | 'cooked',
  toCookingState: 'raw' | 'cooked',
  method: 'baked' | 'grilled' | 'boiled' | 'steamed' | 'roasted'
): number => {
  if (fromCookingState === toCookingState) return portionSize;
  
  let foodType: 'protein' | 'vegetable' | 'grain';
  
  // Map food category to conversion type
  switch (food.category) {
    case 'protein':
      foodType = 'protein';
      break;
    case 'vegetables':
      foodType = 'vegetable';
      break;
    case 'carbs':
      foodType = 'grain';
      break;
    default:
      // Default to protein as a fallback
      foodType = 'protein';
  }
  
  // Use the foodDataService to convert weights
  return foodDataService.convertWeight(
    portionSize,
    foodType,
    fromCookingState,
    toCookingState,
    method
  );
};

/**
 * Distributes macros across meals according to the specified distribution
 */
export const distributeMacrosAcrossMeals = (
  totalProtein: number,
  totalCarbs: number,
  totalFat: number,
  mealDistribution: MealDistribution[]
): Array<{
  name: string;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}> => {
  return foodDataService.distributeMacrosAcrossMeals(
    totalProtein,
    totalCarbs,
    totalFat,
    mealDistribution
  );
};

/**
 * Creates a nutrition object from USDA food data
 */
export const extractNutritionFromUSDA = (foodItem: FoodItem): any => {
  return foodDataService.extractNutritionData(foodItem);
};

/**
 * Validates a meal plan's macro distribution against targets
 * Returns a score from 0-100 representing how well macros are balanced
 */
export const validateMealPlanMacros = (mealPlan: MealPlan): {
  score: number;
  issues: string[];
} => {
  const { targetProtein, targetCarbs, targetFat, actualProtein, actualCarbs, actualFat } = mealPlan;
  
  if (!actualProtein || !actualCarbs || !actualFat) {
    return { score: 0, issues: ["Actual macros not calculated"] };
  }
  
  const issues: string[] = [];
  let totalScore = 100;
  
  // Calculate percentage differences
  const proteinDiff = Math.abs(actualProtein - targetProtein) / targetProtein;
  const carbsDiff = Math.abs(actualCarbs - targetCarbs) / targetCarbs;
  const fatDiff = Math.abs(actualFat - targetFat) / targetFat;
  
  // Deduct points based on how far off each macro is
  if (proteinDiff > 0.05) { // 5% threshold
    totalScore -= Math.min(30, Math.round(proteinDiff * 100));
    issues.push(`Protein is ${(proteinDiff * 100).toFixed(1)}% off target`);
  }
  
  if (carbsDiff > 0.05) {
    totalScore -= Math.min(25, Math.round(carbsDiff * 100));
    issues.push(`Carbs are ${(carbsDiff * 100).toFixed(1)}% off target`);
  }
  
  if (fatDiff > 0.05) {
    totalScore -= Math.min(25, Math.round(fatDiff * 100));
    issues.push(`Fat is ${(fatDiff * 100).toFixed(1)}% off target`);
  }
  
  // Check for meal-by-meal macro balance
  let previousMealRatio = 0;
  mealPlan.meals.forEach((meal) => {
    const mealProteinRatio = meal.totalProtein / actualProtein;
    
    // Check for extreme spikes in protein distribution (inconsistent distribution)
    if (previousMealRatio > 0 && Math.abs(mealProteinRatio - previousMealRatio) > 0.2) {
      totalScore -= 5;
      issues.push("Inconsistent protein distribution between meals");
    }
    
    previousMealRatio = mealProteinRatio;
  });
  
  // Ensure score doesn't go below 0
  totalScore = Math.max(0, totalScore);
  
  return {
    score: totalScore,
    issues: issues.length ? issues : ["Meal plan is well-balanced"]
  };
};
