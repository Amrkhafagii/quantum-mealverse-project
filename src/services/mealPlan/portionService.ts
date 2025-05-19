
import { Food } from '@/types/food';

/**
 * Calculate optimal portion size to hit macro targets while maintaining reasonable portions
 */
export const calculateOptimalPortion = (food: Food, targetGrams: number, nutrientType: string, calorieTarget: number): number => {
  // Get nutrient content in the food
  const nutrientPer100g = food[nutrientType as keyof Food] as number;
  
  // If the food doesn't have any of this nutrient, return a default portion
  if (!nutrientPer100g || nutrientPer100g <= 0) {
    return nutrientType === 'fat' ? 15 : 100;
  }
  
  // Calculate portion needed to hit target nutrient
  const portionNeededForNutrient = (targetGrams / nutrientPer100g) * 100;
  
  // Calculate portion needed to hit calorie target
  const portionNeededForCalories = (calorieTarget / food.calories) * 100;
  
  // Take the average of the two calculations for a balanced approach
  const calculatedPortion = (portionNeededForNutrient + portionNeededForCalories) / 2;
  
  // Apply reasonable limits to portion sizes based on food category
  const minPortion = getMinPortionSize(food.category);
  const maxPortion = getMaxPortionSize(food.category);
  
  return Math.round(Math.min(Math.max(calculatedPortion, minPortion), maxPortion));
};

/**
 * Get minimum reasonable portion size based on food category
 */
export const getMinPortionSize = (category: string): number => {
  switch (category) {
    case 'protein': return 50;  // 50g minimum for protein
    case 'carbs': return 40;    // 40g minimum for carbs
    case 'fats': return 10;     // 10g minimum for fats (oils, nuts, etc.)
    case 'vegetables': return 50; // 50g minimum for vegetables
    case 'fruits': return 80;   // 80g minimum for fruits
    default: return 30;
  }
};

/**
 * Get maximum reasonable portion size based on food category
 */
export const getMaxPortionSize = (category: string): number => {
  switch (category) {
    case 'protein': return 250;  // 250g maximum for protein
    case 'carbs': return 300;    // 300g maximum for carbs
    case 'fats': return 60;      // 60g maximum for fats
    case 'vegetables': return 300; // 300g maximum for vegetables
    case 'fruits': return 200;   // 200g maximum for fruits
    default: return 200;
  }
};

/**
 * Determines appropriate vegetable portion size based on meal type
 */
export const calculateVegetablePortionSize = (veggieFood: Food, mealName: string): number => {
  const lowerMealName = mealName.toLowerCase();
  
  if (lowerMealName === 'breakfast') {
    return 75; // Smaller veggie portion with breakfast
  } else if (lowerMealName === 'snack') {
    return 50; // Small veggie portion for snack
  } else if (lowerMealName === 'lunch' || lowerMealName === 'dinner') {
    return 150; // Larger veggie portions for main meals
  }
  
  return 100; // Default portion size
};

/**
 * Calculate portion size needed to hit a specific nutrient target
 */
export const calculatePortion = (food: Food, targetGrams: number, nutrientType: 'protein' | 'carbs' | 'fat'): number => {
  // Get nutrient content per 100g
  const nutrientPer100g = food[nutrientType];
  
  // If the food doesn't have any of this nutrient, return a default portion
  if (!nutrientPer100g) {
    return nutrientType === 'fat' ? 15 : 100;
  }
  
  // Calculate how many grams of food needed to hit target
  const portionNeeded = (targetGrams / nutrientPer100g) * 100;
  
  // Apply some reasonable limits to portion size
  let limitedPortion: number;
  
  switch (nutrientType) {
    case 'protein':
      limitedPortion = Math.min(Math.max(portionNeeded, 50), 250);
      break;
    case 'carbs':
      limitedPortion = Math.min(Math.max(portionNeeded, 50), 300);
      break;
    case 'fat':
      limitedPortion = Math.min(Math.max(portionNeeded, 10), 50);
      break;
    default:
      limitedPortion = 100;
  }
  
  return Math.round(limitedPortion);
};

/**
 * Adjusts portion size to meet calorie target
 */
export const adjustPortionForCalories = (
  currentCalories: number,
  targetCalories: number,
  currentPortionGrams: number
): number => {
  // If current and target calories are the same, no adjustment needed
  if (currentCalories === targetCalories) return currentPortionGrams;
  
  // Calculate simple ratio for adjustment
  const ratio = targetCalories / currentCalories;
  
  // Apply the ratio to adjust portion size
  let adjustedPortion = currentPortionGrams * ratio;
  
  // Round to nearest 5g for usability
  return Math.round(adjustedPortion / 5) * 5;
};
