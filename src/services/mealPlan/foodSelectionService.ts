
import { Food, FoodCategory } from '@/types/food';
import { foodDatabase, getFoodsByCategory } from '../../data/foodDatabase';

/**
 * Gets suitable foods for each meal type (breakfast, lunch, dinner, snack)
 * Falls back to category-based selection if meal-specific filtering returns no results
 */
export const getSuitableFoodsForMeal = (mealType: string): {
  proteins: Food[],
  carbs: Food[],
  fats: Food[],
  veggies: Food[],
  fruits: Food[]
} => {
  // First try to filter foods suitable for this meal type
  const suitableFoods = foodDatabase.filter(food => 
    food.mealSuitability?.includes(mealType)
  );
  
  // Group by category
  let proteins = suitableFoods.filter(food => food.category === 'protein');
  let carbs = suitableFoods.filter(food => food.category === 'carbs');
  let fats = suitableFoods.filter(food => food.category === 'fats');
  let veggies = suitableFoods.filter(food => food.category === 'vegetables');
  let fruits = suitableFoods.filter(food => food.category === 'fruits');
  
  // If any category is empty, fall back to all foods from that category
  if (proteins.length === 0) {
    proteins = getFoodsByCategory('protein');
  }
  if (carbs.length === 0) {
    carbs = getFoodsByCategory('carbs');
  }
  if (fats.length === 0) {
    fats = getFoodsByCategory('fats');
  }
  if (veggies.length === 0) {
    veggies = getFoodsByCategory('vegetables');
  }
  if (fruits.length === 0) {
    fruits = getFoodsByCategory('fruits');
  }
  
  return {
    proteins,
    carbs,
    fats,
    veggies,
    fruits
  };
};

/**
 * Selects optimal food from a category based on target nutrient
 * Always returns a real food from the database - no fallbacks
 */
export const selectOptimalFood = (foods: Food[], nutrientType: string, targetAmount: number): Food => {
  // Ensure we always have foods to select from
  if (!foods || foods.length === 0) {
    throw new Error(`No foods available for selection in category: ${nutrientType}`);
  }
  
  // If there's a target amount, try to find foods that have good nutrient density
  if (targetAmount > 0) {
    // Sort by nutrient density (amount of target nutrient per calorie)
    const sortedFoods = [...foods].sort((a, b) => {
      const densityA = (a[nutrientType as keyof Food] as number || 0) / Math.max(a.calories, 1);
      const densityB = (b[nutrientType as keyof Food] as number || 0) / Math.max(b.calories, 1);
      return densityB - densityA; // Higher density first
    });
    
    // Return one of the top 3 options randomly for variety
    const topOptions = sortedFoods.slice(0, Math.min(3, sortedFoods.length));
    return topOptions[Math.floor(Math.random() * topOptions.length)];
  }
  
  // If no target, just return a random food
  return foods[Math.floor(Math.random() * foods.length)];
};
