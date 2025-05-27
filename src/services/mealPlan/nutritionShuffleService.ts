
import { NutritionCartItem } from '@/contexts/NutritionCartContext';
import { TDEEResult } from '@/components/fitness/TDEECalculator';
import { generateNutritionMealPlan } from './nutritionMealGenerationService';
import { 
  getFoodsByMealType, 
  getRandomFoodByMealTypeAndCategory,
  calculateNutritionForPortion,
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
  
  // Generate new items for this meal type with similar nutrition targets
  return generateMealItemsFromDatabase(mealType, totalCalories, totalProtein, totalCarbs, totalFat, tdeeResult.goal);
};

/**
 * Shuffles a single nutrition item with similar nutritional profile
 */
export const shuffleSingleItem = (
  item: NutritionCartItem,
  goal: string
): Omit<NutritionCartItem, 'id'> => {
  // Get alternative foods for the same meal type and category
  const availableFoods = getFoodsByMealType(item.meal_type);
  
  // Filter by category if specified, otherwise get any food for that meal
  let alternatives = item.food_category 
    ? availableFoods.filter(food => food.category === item.food_category)
    : availableFoods;
  
  // Remove the current food from alternatives
  alternatives = alternatives.filter(food => food.name !== item.name);
  
  if (alternatives.length === 0) {
    // If no alternatives found, return the original item
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
  const randomFood = alternatives[Math.floor(Math.random() * alternatives.length)];
  
  // Calculate portion size to match similar calories
  const targetCalories = item.calories * item.quantity;
  const portionSize = calculateOptimalPortion(randomFood, targetCalories);
  const nutrition = calculateNutritionForPortion(randomFood, portionSize);
  
  return {
    name: randomFood.name,
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    quantity: 1,
    portion_size: portionSize,
    meal_type: item.meal_type,
    food_category: randomFood.category,
    usda_food_id: randomFood.usda_food_id
  };
};

function generateMealItemsFromDatabase(
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number,
  goal: string
): Omit<NutritionCartItem, 'id'>[] {
  const items: Omit<NutritionCartItem, 'id'>[] = [];
  
  // Get available foods for this meal type
  const availableFoods = getFoodsByMealType(mealType);
  
  if (availableFoods.length === 0) {
    return items;
  }
  
  // Use the same strategy as the main generation service
  switch (mealType) {
    case 'breakfast':
      const breakfastGrain = getRandomFoodByMealTypeAndCategory(mealType, 'grains');
      const breakfastProtein = getRandomFoodByMealTypeAndCategory(mealType, 'dairy');
      
      if (breakfastGrain) {
        const portion = calculateOptimalPortion(breakfastGrain, targetCalories * 0.6);
        const nutrition = calculateNutritionForPortion(breakfastGrain, portion);
        
        items.push({
          name: breakfastGrain.name,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          quantity: 1,
          portion_size: portion,
          meal_type: mealType,
          food_category: breakfastGrain.category,
          usda_food_id: breakfastGrain.usda_food_id
        });
      }
      
      if (breakfastProtein) {
        const portion = calculateOptimalPortion(breakfastProtein, targetCalories * 0.4);
        const nutrition = calculateNutritionForPortion(breakfastProtein, portion);
        
        items.push({
          name: breakfastProtein.name,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          quantity: 1,
          portion_size: portion,
          meal_type: mealType,
          food_category: breakfastProtein.category,
          usda_food_id: breakfastProtein.usda_food_id
        });
      }
      break;

    case 'lunch':
      const lunchProtein = getRandomFoodByMealTypeAndCategory(mealType, 'protein');
      const lunchGrain = getRandomFoodByMealTypeAndCategory(mealType, 'grains');
      const lunchVegetable = getRandomFoodByMealTypeAndCategory(mealType, 'vegetables');
      
      if (lunchProtein) {
        const portion = calculateOptimalPortion(lunchProtein, targetCalories * 0.5);
        const nutrition = calculateNutritionForPortion(lunchProtein, portion);
        
        items.push({
          name: lunchProtein.name,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          quantity: 1,
          portion_size: portion,
          meal_type: mealType,
          food_category: lunchProtein.category,
          usda_food_id: lunchProtein.usda_food_id
        });
      }
      
      if (lunchGrain) {
        const portion = calculateOptimalPortion(lunchGrain, targetCalories * 0.3);
        const nutrition = calculateNutritionForPortion(lunchGrain, portion);
        
        items.push({
          name: lunchGrain.name,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          quantity: 1,
          portion_size: portion,
          meal_type: mealType,
          food_category: lunchGrain.category,
          usda_food_id: lunchGrain.usda_food_id
        });
      }
      
      if (lunchVegetable) {
        const portion = calculateOptimalPortion(lunchVegetable, targetCalories * 0.2);
        const nutrition = calculateNutritionForPortion(lunchVegetable, portion);
        
        items.push({
          name: lunchVegetable.name,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          quantity: 1,
          portion_size: portion,
          meal_type: mealType,
          food_category: lunchVegetable.category,
          usda_food_id: lunchVegetable.usda_food_id
        });
      }
      break;

    case 'dinner':
      const dinnerProtein = getRandomFoodByMealTypeAndCategory(mealType, 'protein');
      const dinnerCarb = getRandomFoodByMealTypeAndCategory(mealType, 'vegetables') || 
                         getRandomFoodByMealTypeAndCategory(mealType, 'grains');
      const dinnerVegetable = getRandomFoodByMealTypeAndCategory(mealType, 'vegetables');
      
      if (dinnerProtein) {
        const portion = calculateOptimalPortion(dinnerProtein, targetCalories * 0.6);
        const nutrition = calculateNutritionForPortion(dinnerProtein, portion);
        
        items.push({
          name: dinnerProtein.name,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          quantity: 1,
          portion_size: portion,
          meal_type: mealType,
          food_category: dinnerProtein.category,
          usda_food_id: dinnerProtein.usda_food_id
        });
      }
      
      if (dinnerCarb) {
        const portion = calculateOptimalPortion(dinnerCarb, targetCalories * 0.25);
        const nutrition = calculateNutritionForPortion(dinnerCarb, portion);
        
        items.push({
          name: dinnerCarb.name,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          quantity: 1,
          portion_size: portion,
          meal_type: mealType,
          food_category: dinnerCarb.category,
          usda_food_id: dinnerCarb.usda_food_id
        });
      }
      
      if (dinnerVegetable && dinnerVegetable.id !== dinnerCarb?.id) {
        const portion = calculateOptimalPortion(dinnerVegetable, targetCalories * 0.15);
        const nutrition = calculateNutritionForPortion(dinnerVegetable, portion);
        
        items.push({
          name: dinnerVegetable.name,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          quantity: 1,
          portion_size: portion,
          meal_type: mealType,
          food_category: dinnerVegetable.category,
          usda_food_id: dinnerVegetable.usda_food_id
        });
      }
      break;

    case 'snack':
      const snackNuts = getRandomFoodByMealTypeAndCategory(mealType, 'nuts');
      const snackFruit = getRandomFoodByMealTypeAndCategory(mealType, 'fruits');
      
      if (snackNuts) {
        const portion = calculateOptimalPortion(snackNuts, targetCalories * 0.7);
        const nutrition = calculateNutritionForPortion(snackNuts, portion);
        
        items.push({
          name: snackNuts.name,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          quantity: 1,
          portion_size: portion,
          meal_type: mealType,
          food_category: snackNuts.category,
          usda_food_id: snackNuts.usda_food_id
        });
      }
      
      if (snackFruit) {
        const portion = calculateOptimalPortion(snackFruit, targetCalories * 0.3);
        const nutrition = calculateNutritionForPortion(snackFruit, portion);
        
        items.push({
          name: snackFruit.name,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          quantity: 1,
          portion_size: portion,
          meal_type: mealType,
          food_category: snackFruit.category,
          usda_food_id: snackFruit.usda_food_id
        });
      }
      break;
  }

  return items;
}

/**
 * Calculate optimal portion size to meet target calories
 */
function calculateOptimalPortion(food: FoodItem, targetCalories: number): number {
  if (food.calories === 0) return food.defaultPortionSize;
  
  // Calculate portion needed to meet target calories
  const portionForCalories = (targetCalories / food.calories) * 100; // Convert to grams
  
  // Use reasonable bounds - between 50% and 200% of default portion
  const minPortion = food.defaultPortionSize * 0.5;
  const maxPortion = food.defaultPortionSize * 2;
  
  return Math.max(minPortion, Math.min(maxPortion, portionForCalories));
}
