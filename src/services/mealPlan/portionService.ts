import { Food } from '@/types/food';

/**
 * Calculate optimal portion size to hit macro targets while maintaining reasonable portions
 * Enhanced to prioritize protein content and logical portion sizes
 */
export const calculateOptimalPortion = (food: Food, targetGrams: number, nutrientType: string, calorieTarget: number): number => {
  // Get nutrient content in the food
  const nutrientPer100g = food[nutrientType as keyof Food] as number;
  
  // Enhanced logic for protein foods - ensure substantial portions
  if (nutrientType === 'protein' && food.category === 'protein') {
    // Set minimum protein portions based on food type
    const minProteinPortion = getMinimumProteinPortion(food);
    
    if (!nutrientPer100g || nutrientPer100g <= 0) {
      return minProteinPortion;
    }
    
    // Calculate portion needed to hit target protein
    const portionNeededForProtein = (targetGrams / nutrientPer100g) * 100;
    
    // Use the larger of minimum portion or calculated portion
    const finalPortion = Math.max(minProteinPortion, portionNeededForProtein);
    
    // Apply maximum limits
    const maxPortion = getMaxPortionSize(food.category);
    return Math.round(Math.min(finalPortion, maxPortion));
  }
  
  // If the food doesn't have any of this nutrient, return a default portion
  if (!nutrientPer100g || nutrientPer100g <= 0) {
    return getDefaultPortionSize(food.category);
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
 * Get minimum protein portion based on food type for better meal balance
 */
export const getMinimumProteinPortion = (food: Food): number => {
  const foodName = food.name.toLowerCase();
  
  // Protein powder - smaller portions
  if (foodName.includes('protein powder') || foodName.includes('whey')) {
    return 25;
  }
  
  // Dairy products - moderate portions
  if (foodName.includes('cheese') || foodName.includes('yogurt') || 
      foodName.includes('labneh') || foodName.includes('cottage')) {
    return 150;
  }
  
  // Eggs - standard portion
  if (foodName.includes('egg')) {
    return 100; // ~2 eggs
  }
  
  // Fish and seafood - substantial portions
  if (foodName.includes('fish') || foodName.includes('tuna') || 
      foodName.includes('salmon') || foodName.includes('tilapia')) {
    return 150;
  }
  
  // Meat and poultry - substantial portions
  if (foodName.includes('chicken') || foodName.includes('beef') || 
      foodName.includes('turkey') || foodName.includes('lamb') || 
      foodName.includes('duck') || foodName.includes('rabbit')) {
    return 150;
  }
  
  // Legumes and beans - larger portions needed for protein
  if (foodName.includes('beans') || foodName.includes('chickpea') || 
      foodName.includes('lentil') || foodName.includes('foul')) {
    return 200;
  }
  
  // Default protein minimum
  return 100;
};

/**
 * Get default portion size when nutrient content is zero
 */
export const getDefaultPortionSize = (category: string): number => {
  switch (category) {
    case 'protein': return 150; // Increased default for proteins
    case 'carbs': return 80;
    case 'fats': return 15;
    case 'vegetables': return 100;
    case 'fruits': return 120;
    default: return 100;
  }
};

/**
 * Get minimum reasonable portion size based on food category
 */
export const getMinPortionSize = (category: string): number => {
  switch (category) {
    case 'protein': return 80;   // Increased minimum for protein
    case 'carbs': return 50;     
    case 'fats': return 10;      
    case 'vegetables': return 80; 
    case 'fruits': return 100;   
    default: return 50;
  }
};

/**
 * Get maximum reasonable portion size based on food category
 */
export const getMaxPortionSize = (category: string): number => {
  switch (category) {
    case 'protein': return 300;  // Increased maximum for protein
    case 'carbs': return 350;    // Slightly increased for carbs
    case 'fats': return 60;      
    case 'vegetables': return 300; 
    case 'fruits': return 250;   
    default: return 250;
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
