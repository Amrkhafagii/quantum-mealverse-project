
import { Food, FoodCategory } from '@/types/food';
import { foodDatabase, getFoodsByCategory } from '../../data/foodDatabase';

/**
 * Gets suitable foods for each meal type (breakfast, lunch, dinner, snack)
 * Returns foods grouped by category for use with compatibility templates
 */
export const getSuitableFoodsForMeal = (mealType: string): {
  protein: Food[],
  carbs: Food[],
  fats: Food[],
  vegetables: Food[],
  fruits: Food[]
} => {
  // First try to filter foods suitable for this meal type
  const suitableFoods = foodDatabase.filter(food => 
    food.mealSuitability?.includes(mealType)
  );
  
  // Group by category
  let protein = suitableFoods.filter(food => food.category === 'protein');
  let carbs = suitableFoods.filter(food => food.category === 'carbs');
  let fats = suitableFoods.filter(food => food.category === 'fats');
  let vegetables = suitableFoods.filter(food => food.category === 'vegetables');
  let fruits = suitableFoods.filter(food => food.category === 'fruits');
  
  // Enhanced fallback logic - prioritize foods that make sense for the meal type
  if (protein.length === 0) {
    if (mealType === 'breakfast') {
      // Prioritize breakfast-friendly proteins
      protein = getFoodsByCategory('protein').filter(food => 
        food.name.toLowerCase().includes('egg') ||
        food.name.toLowerCase().includes('yogurt') ||
        food.name.toLowerCase().includes('cheese') ||
        food.name.toLowerCase().includes('protein powder') ||
        food.name.toLowerCase().includes('salmon')
      );
      // If still empty, use all proteins
      if (protein.length === 0) protein = getFoodsByCategory('protein');
    } else {
      protein = getFoodsByCategory('protein');
    }
  }
  
  if (carbs.length === 0) {
    if (mealType === 'breakfast') {
      // Prioritize breakfast carbs
      carbs = getFoodsByCategory('carbs').filter(food => 
        food.name.toLowerCase().includes('oats') ||
        food.name.toLowerCase().includes('bread') ||
        food.name.toLowerCase().includes('granola') ||
        food.name.toLowerCase().includes('muesli')
      );
      if (carbs.length === 0) carbs = getFoodsByCategory('carbs');
    } else {
      carbs = getFoodsByCategory('carbs');
    }
  }
  
  if (fats.length === 0) {
    fats = getFoodsByCategory('fats');
  }
  
  if (vegetables.length === 0) {
    if (mealType === 'breakfast') {
      // Prioritize breakfast-friendly vegetables
      vegetables = getFoodsByCategory('vegetables').filter(food => 
        food.name.toLowerCase().includes('spinach') ||
        food.name.toLowerCase().includes('tomato') ||
        food.name.toLowerCase().includes('mushroom') ||
        food.name.toLowerCase().includes('bell pepper')
      );
      if (vegetables.length === 0) vegetables = getFoodsByCategory('vegetables');
    } else {
      vegetables = getFoodsByCategory('vegetables');
    }
  }
  
  if (fruits.length === 0) {
    fruits = getFoodsByCategory('fruits');
  }
  
  return {
    protein,
    carbs,
    fats,
    vegetables,
    fruits
  };
};

/**
 * Selects optimal food from a category based on target nutrient and meal context
 * Prioritizes foods that work well together and have good protein density
 */
export const selectOptimalFood = (foods: Food[], nutrientType: string, targetAmount: number, mealContext?: string): Food => {
  // Ensure we always have foods to select from
  if (!foods || foods.length === 0) {
    throw new Error(`No foods available for selection in category: ${nutrientType}`);
  }
  
  // Enhanced selection for protein foods - prioritize high-protein options
  if (nutrientType === 'protein') {
    // Sort by protein content (highest first) and select from top options
    const highProteinFoods = [...foods].sort((a, b) => b.protein - a.protein);
    
    // Take top 5 high-protein foods for variety
    const topOptions = highProteinFoods.slice(0, Math.min(5, highProteinFoods.length));
    return topOptions[Math.floor(Math.random() * topOptions.length)];
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
