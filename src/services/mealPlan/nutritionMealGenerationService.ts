
import { NutritionCartItem } from '@/contexts/NutritionCartContext';
import { TDEEResult } from './types';
import { 
  getFoodsByMealType, 
  getRandomFoodByMealTypeAndCategory,
  calculateNutritionForPortion,
  FoodItem 
} from '../foodDatabase';

/**
 * Generate nutrition cart items based on TDEE calculation using food database
 */
export const generateNutritionMealPlan = (tdeeResult: TDEEResult): Omit<NutritionCartItem, 'id'>[] => {
  const { adjustedCalories, proteinGrams, carbsGrams, fatsGrams, goal, weight, activityLevel } = tdeeResult;
  
  // Meal distribution for optimal nutrition
  const mealDistribution = [
    { name: 'breakfast', ratio: 0.25, protein: 0.25, carbs: 0.30, fat: 0.20 },
    { name: 'lunch', ratio: 0.35, protein: 0.35, carbs: 0.35, fat: 0.35 },
    { name: 'snack', ratio: 0.10, protein: 0.10, carbs: 0.15, fat: 0.15 },
    { name: 'dinner', ratio: 0.30, protein: 0.30, carbs: 0.20, fat: 0.30 }
  ];

  const nutritionItems: Omit<NutritionCartItem, 'id'>[] = [];

  mealDistribution.forEach(meal => {
    const targetCalories = Math.round(adjustedCalories * meal.ratio);
    const targetProtein = Math.round(proteinGrams * meal.protein);
    const targetCarbs = Math.round(carbsGrams * meal.carbs);
    const targetFat = Math.round(fatsGrams * meal.fat);

    // Generate food items for this meal based on goals
    const mealItems = generateMealItemsFromDatabase(
      meal.name as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      goal
    );

    nutritionItems.push(...mealItems);
  });

  return nutritionItems;
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
    console.warn(`No foods available for meal type: ${mealType}`);
    return items;
  }
  
  // Strategy: Select foods based on meal type and nutritional targets
  switch (mealType) {
    case 'breakfast':
      // Get a grain-based food and a protein/dairy food
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
      // Get protein, grain, and vegetable
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
      // Get protein, carb, and vegetable
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
      // Get nuts and fruit
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
