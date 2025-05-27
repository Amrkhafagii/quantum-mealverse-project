
import { NutritionCartItem } from '@/contexts/NutritionCartContext';
import { TDEEResult } from '@/components/fitness/TDEECalculator';
import { generateNutritionMealPlan } from './nutritionMealGenerationService';
import { getFoodsByMealType, getFoodsByCategory, calculateNutritionForPortion } from '../foodDatabase';

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
  return generateMealItems(mealType, totalCalories, totalProtein, totalCarbs, totalFat, tdeeResult.goal);
};

/**
 * Shuffles a single nutrition item with similar nutritional profile
 */
export const shuffleSingleItem = (
  item: NutritionCartItem,
  goal: string
): Omit<NutritionCartItem, 'id'> => {
  const alternatives = getAlternativeItems(item.meal_type, item.food_category || 'protein');
  
  if (alternatives.length === 0) {
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
  
  // Calculate portion to match original item's calories
  const targetCalories = item.calories * item.quantity;
  let bestPortion = randomFood.common_portion_size;
  let bestCalorieDiff = Number.MAX_SAFE_INTEGER;
  
  // Find portion size that best matches original calories
  for (let portion = 20; portion <= 300; portion += 10) {
    const nutrition = calculateNutritionForPortion(randomFood, portion);
    const calorieDiff = Math.abs(nutrition.calories - targetCalories);
    
    if (calorieDiff < bestCalorieDiff) {
      bestCalorieDiff = calorieDiff;
      bestPortion = portion;
    }
  }
  
  const finalNutrition = calculateNutritionForPortion(randomFood, bestPortion);
  
  return {
    name: randomFood.name,
    calories: finalNutrition.calories,
    protein: finalNutrition.protein,
    carbs: finalNutrition.carbs,
    fat: finalNutrition.fat,
    quantity: 1,
    portion_size: bestPortion,
    meal_type: item.meal_type,
    food_category: randomFood.category,
    usda_food_id: randomFood.id
  };
};

function generateMealItems(
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
  
  if (availableFoods.length === 0) return items;

  // Simple approach: select 2-3 random foods and distribute calories
  const numItems = Math.min(3, availableFoods.length);
  const selectedFoods = [];
  const usedIndices = new Set<number>();
  
  // Select unique random foods
  while (selectedFoods.length < numItems && usedIndices.size < availableFoods.length) {
    const randomIndex = Math.floor(Math.random() * availableFoods.length);
    if (!usedIndices.has(randomIndex)) {
      selectedFoods.push(availableFoods[randomIndex]);
      usedIndices.add(randomIndex);
    }
  }
  
  // Distribute calories among selected foods
  const caloriesPerFood = targetCalories / selectedFoods.length;
  
  selectedFoods.forEach(food => {
    // Calculate portion to meet calorie target
    const targetFoodCalories = caloriesPerFood;
    const portionRatio = targetFoodCalories / food.calories_per_100g;
    const portionSize = Math.max(20, Math.min(300, portionRatio * 100));
    
    const nutrition = calculateNutritionForPortion(food, portionSize);
    
    items.push({
      name: food.name,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      quantity: 1,
      portion_size: portionSize,
      meal_type: mealType,
      food_category: food.category,
      usda_food_id: food.id
    });
  });
  
  return items;
}

function getAlternativeItems(
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  category: string
): any[] {
  // Get foods from the same category that are suitable for this meal type
  const categoryFoods = getFoodsByCategory(category as any);
  const mealTypeFoods = getFoodsByMealType(mealType);
  
  // Find intersection of category and meal type
  return categoryFoods.filter(food => 
    mealTypeFoods.some(mealFood => mealFood.id === food.id)
  );
}
