import { Food, FoodCategory, CookingState } from '@/types/food';
import { foodDataService } from '../foodDataService';
import { foodDatabase } from '../../data/foodDatabase';

/**
 * Gets suitable foods for each meal type (breakfast, lunch, dinner, snack)
 */
export const getSuitableFoodsForMeal = (mealType: string): {
  proteins: Food[],
  carbs: Food[],
  fats: Food[],
  veggies: Food[],
  fruits: Food[]
} => {
  // Filter foods suitable for this meal type
  const suitableFoods = foodDatabase.filter(food => 
    food.mealSuitability?.includes(mealType) || !food.mealSuitability
  );
  
  // Group by category
  return {
    proteins: suitableFoods.filter(food => food.category === 'protein'),
    carbs: suitableFoods.filter(food => food.category === 'carbs'),
    fats: suitableFoods.filter(food => food.category === 'fats'),
    veggies: suitableFoods.filter(food => food.category === 'vegetables'),
    fruits: suitableFoods.filter(food => food.category === 'fruits')
  };
};

/**
 * Selects optimal food from a category based on target nutrient
 */
export const selectOptimalFood = (foods: Food[], nutrientType: string, targetAmount: number): Food => {
  if (!foods || foods.length === 0) {
    // Use fallback food if no foods are available
    return createFallbackFood(nutrientType as FoodCategory, `${nutrientType} food`);
  }
  
  // If there's a target amount, try to find foods that have good nutrient density
  if (targetAmount > 0) {
    // Sort by nutrient density (amount of target nutrient per calorie)
    foods.sort((a, b) => {
      const densityA = a[nutrientType as keyof Food] as number / a.calories;
      const densityB = b[nutrientType as keyof Food] as number / b.calories;
      return densityB - densityA; // Higher density first
    });
    
    // Return one of the top 3 options randomly for variety
    const topOptions = foods.slice(0, Math.min(3, foods.length));
    return topOptions[Math.floor(Math.random() * topOptions.length)];
  }
  
  // If no target, just return a random food
  return foods[Math.floor(Math.random() * foods.length)];
};

/**
 * Create a fallback food item if API fails - returns a proper Food object
 */
export const createFallbackFood = (category: string, name: string): Food => {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  const foodCategory = category as FoodCategory || 'protein';
  
  // Use reasonable defaults based on category
  switch (category) {
    case 'protein':
      calories = 165;
      protein = 25;
      carbs = 0;
      fat = 8;
      break;
    case 'carbs':
      calories = 120;
      protein = 3;
      carbs = 25;
      fat = 1;
      break;
    case 'fats':
      calories = 160;
      protein = 2;
      carbs = 5;
      fat = 14;
      break;
    case 'vegetables':
      calories = 35;
      protein = 2;
      carbs = 7;
      fat = 0;
      break;
    case 'fruits':
      calories = 50;
      protein = 1;
      carbs = 12;
      fat = 0;
      break;
    default:
      // Default to protein if category is unknown
      calories = 165;
      protein = 25;
      carbs = 0;
      fat = 8;
  }
  
  // Create and return a properly structured Food object
  return {
    id: crypto.randomUUID(),
    name: name,
    category: foodCategory,
    calories: calories,
    protein: protein,
    carbs: carbs,
    fat: fat,
    portion: 100, // default 100g portion
    isGloballyAvailable: true,
    costTier: 1,
    cookingState: 'raw' as CookingState
  };
};
