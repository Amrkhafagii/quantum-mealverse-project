
import { Meal, Food, MealFood } from '@/types/food';
import { getSuitableFoodsForMeal } from './foodSelectionService';
import { 
  getMealTemplate, 
  selectCompatibleFoods, 
  calculateEnhancedPortions,
  areFoodsCompatible 
} from './foodCompatibilityService';

/**
 * Creates a balanced meal using food compatibility templates
 * Always uses real foods from the database with logical combinations
 */
export const createBalancedMeal = (
  mealName: string,
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): Meal => {
  console.log(`Creating meal: ${mealName} with targets - Calories: ${targetCalories}, Protein: ${targetProtein}g, Carbs: ${targetCarbs}g, Fat: ${targetFat}g`);
  
  // Get suitable foods for this meal type
  const mealType = mealName.toLowerCase();
  const suitableFoods = getSuitableFoodsForMeal(mealType);
  
  console.log(`Available foods for ${mealName}:`, {
    protein: suitableFoods.protein.length,
    carbs: suitableFoods.carbs.length,
    fats: suitableFoods.fats.length,
    vegetables: suitableFoods.vegetables.length,
    fruits: suitableFoods.fruits.length
  });

  // Get appropriate meal template for this meal type
  const template = getMealTemplate(mealType);
  console.log(`Using meal template: ${template.name} for ${mealName}`);

  // Select compatible foods based on template
  const selectedFoods = selectCompatibleFoods(suitableFoods, template);
  
  if (selectedFoods.length === 0) {
    throw new Error(`No compatible foods found for meal ${mealName}`);
  }

  // Verify food compatibility
  const areCompatible = areFoodsCompatible(selectedFoods, template);
  if (!areCompatible) {
    console.warn(`Foods selected for ${mealName} may not be fully compatible, but proceeding`);
  }

  // Calculate enhanced portions with minimum protein requirements
  const mealFoodsWithPortions = calculateEnhancedPortions(
    selectedFoods,
    template,
    targetProtein,
    targetCarbs,
    targetFat
  );

  // Calculate actual nutritional values
  let currentCalories = 0;
  let currentProtein = 0;
  let currentCarbs = 0;
  let currentFat = 0;

  const mealFoods: MealFood[] = mealFoodsWithPortions.map(({ food, portionSize }) => {
    const basePortionSize = food.portion || 100;
    const portionRatio = portionSize / basePortionSize;
    
    const foodCalories = food.calories * portionRatio;
    const foodProtein = food.protein * portionRatio;
    const foodCarbs = food.carbs * portionRatio;
    const foodFat = food.fat * portionRatio;

    currentCalories += foodCalories;
    currentProtein += foodProtein;
    currentCarbs += foodCarbs;
    currentFat += foodFat;

    console.log(`Added ${food.name} (${portionSize}g) - Calories: ${Math.round(foodCalories)}, Protein: ${Math.round(foodProtein)}g`);

    return {
      food: food,
      portionSize: portionSize
    };
  });

  const meal: Meal = {
    id: crypto.randomUUID(),
    name: mealName,
    foods: mealFoods,
    totalCalories: Math.round(currentCalories),
    totalProtein: Math.round(currentProtein),
    totalCarbs: Math.round(currentCarbs),
    totalFat: Math.round(currentFat)
  };

  console.log(`Created compatible meal ${mealName}:`, {
    totalCalories: meal.totalCalories,
    totalProtein: meal.totalProtein,
    totalCarbs: meal.totalCarbs,
    totalFat: meal.totalFat,
    foodCount: meal.foods.length,
    template: template.name,
    cookingMethod: template.cookingMethod
  });

  return meal;
};

/**
 * Shuffles a meal by regenerating it with the same targets using compatibility rules
 */
export const shuffleMeal = (
  meal: Meal,
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): Meal => {
  console.log(`Shuffling meal: ${meal.name} with compatibility rules`);
  return createBalancedMeal(meal.name, targetCalories, targetProtein, targetCarbs, targetFat);
};
