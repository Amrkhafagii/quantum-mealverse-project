import { NutritionCartItem } from '@/contexts/NutritionCartContext';
import { TDEEResult } from '@/components/fitness/TDEECalculator';
import { generateNutritionMealPlan } from './nutritionMealGenerationService';
import { 
  getFoodsByMealType, 
  getFoodsByCategory, 
  calculateNutritionForPortion,
  getRandomFoodsByMealType,
  FoodItem 
} from '../foodDatabase';

/**
 * Shuffles nutrition cart items by generating new alternatives
 */
export const shuffleNutritionPlan = (
  currentItems: NutritionCartItem[],
  tdeeResult: TDEEResult
): Omit<NutritionCartItem, 'id'>[] => {
  // Generate a completely new meal plan
  return generateNutritionMealPlan(tdeeResult);
};

/**
 * Shuffles a specific meal type (breakfast, lunch, dinner, snack)
 */
export const shuffleMealType = (
  currentItems: NutritionCartItem[],
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  tdeeResult: TDEEResult
): Omit<NutritionCartItem, 'id'>[] => {
  // Filter items for the specific meal type
  const mealItems = currentItems.filter(item => item.meal_type === mealType);
  
  if (mealItems.length === 0) return [];
  
  // Calculate total nutrition for this meal type
  const totalCalories = mealItems.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
  const totalProtein = mealItems.reduce((sum, item) => sum + (item.protein * item.quantity), 0);
  const totalCarbs = mealItems.reduce((sum, item) => sum + (item.carbs * item.quantity), 0);
  const totalFat = mealItems.reduce((sum, item) => sum + (item.fat * item.quantity), 0);
  
  // Get random foods for this meal type
  const availableFoods = getRandomFoodsByMealType(mealType, 5);
  
  return generateMealItemsFromFoods(availableFoods, mealType, totalCalories);
};

/**
 * Shuffles a single nutrition item with similar nutritional profile
 */
export const shuffleSingleItem = (
  item: NutritionCartItem,
  goal: string
): Omit<NutritionCartItem, 'id'> => {
  // Get alternative foods from the same category and meal type
  const categoryFoods = getFoodsByCategory(item.food_category as any);
  const mealTypeFoods = categoryFoods.filter(food => 
    food.mealTypes.includes(item.meal_type)
  );
  
  // Filter out the current food
  const alternatives = mealTypeFoods.filter(food => food.id !== item.usda_food_id);
  
  if (alternatives.length === 0) {
    // Return the original item if no alternatives found
    return {
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      quantity: item.quantity,
      portion_size: item.portion_size,
      meal_type: item.meal_type,
      food_category: item.food_category,
      usda_food_id: item.usda_food_id
    };
  }
  
  // Select a random alternative
  const randomAlternative = alternatives[Math.floor(Math.random() * alternatives.length)];
  
  // Calculate portion to match similar calories to original item
  const targetCalories = item.calories * item.quantity;
  const adjustedPortion = calculatePortionForCalories(randomAlternative, targetCalories);
  const nutrition = calculateNutritionForPortion(randomAlternative, adjustedPortion);
  
  return {
    name: randomAlternative.name,
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    quantity: 1,
    portion_size: adjustedPortion,
    meal_type: item.meal_type,
    food_category: randomAlternative.category,
    usda_food_id: randomAlternative.id
  };
};

function generateMealItemsFromFoods(
  foods: FoodItem[],
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  targetCalories: number
): Omit<NutritionCartItem, 'id'>[] {
  const items: Omit<NutritionCartItem, 'id'>[] = [];
  
  if (foods.length === 0) return items;
  
  // Distribute calories among the selected foods
  const caloriesPerFood = Math.round(targetCalories / Math.min(foods.length, 3));
  
  // Take up to 3 foods for variety
  const selectedFoods = foods.slice(0, 3);
  
  selectedFoods.forEach(food => {
    const portion = calculatePortionForCalories(food, caloriesPerFood);
    const nutrition = calculateNutritionForPortion(food, portion);
    
    items.push({
      name: food.name,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      quantity: 1,
      portion_size: portion,
      meal_type: mealType,
      food_category: food.category,
      usda_food_id: food.id
    });
  });
  
  return items;
}

function calculatePortionForCalories(food: FoodItem, targetCalories: number): number {
  // Calculate portion needed to reach target calories
  const portionForCalories = (targetCalories * 100) / food.calories;
  
  // Keep portion sizes reasonable
  const minPortion = food.defaultPortion * 0.2;
  const maxPortion = food.defaultPortion * 3;
  
  return Math.round(Math.max(minPortion, Math.min(maxPortion, portionForCalories)));
}
