
import { Meal, Food, MealFood } from '@/types/food';
import { getSuitableFoodsForMeal, selectOptimalFood } from './foodSelectionService';

/**
 * Creates a balanced meal with specified calorie and macro targets
 * Always uses real foods from the database - no fallbacks
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
    proteins: suitableFoods.proteins.length,
    carbs: suitableFoods.carbs.length,
    fats: suitableFoods.fats.length,
    veggies: suitableFoods.veggies.length,
    fruits: suitableFoods.fruits.length
  });

  const mealFoods: MealFood[] = [];
  let currentCalories = 0;
  let currentProtein = 0;
  let currentCarbs = 0;
  let currentFat = 0;

  // Helper function to add food with proper portion calculation
  const addFoodToMeal = (food: Food, targetNutrient: string, targetAmount: number) => {
    try {
      const basePortionSize = food.portion || 100;
      let portionSize = basePortionSize;
      
      // Calculate portion size based on target nutrient if specified
      if (targetAmount > 0 && food[targetNutrient as keyof Food]) {
        const nutrientPerBasePortion = food[targetNutrient as keyof Food] as number;
        if (nutrientPerBasePortion > 0) {
          const desiredPortion = (targetAmount / nutrientPerBasePortion) * basePortionSize;
          portionSize = Math.max(10, Math.min(500, desiredPortion)); // Keep portions reasonable
        }
      }

      const portionRatio = portionSize / basePortionSize;
      const foodCalories = food.calories * portionRatio;
      const foodProtein = food.protein * portionRatio;
      const foodCarbs = food.carbs * portionRatio;
      const foodFat = food.fat * portionRatio;

      mealFoods.push({
        food: food,
        portionSize: Math.round(portionSize)
      });

      currentCalories += foodCalories;
      currentProtein += foodProtein;
      currentCarbs += foodCarbs;
      currentFat += foodFat;

      console.log(`Added ${food.name} (${Math.round(portionSize)}g) - Calories: ${Math.round(foodCalories)}, Protein: ${Math.round(foodProtein)}g`);
    } catch (error) {
      console.error(`Error adding food ${food.name}:`, error);
    }
  };

  try {
    // 1. Add primary protein source (aim for 60-80% of protein target)
    if (suitableFoods.proteins.length > 0) {
      const proteinFood = selectOptimalFood(suitableFoods.proteins, 'protein', targetProtein * 0.7);
      addFoodToMeal(proteinFood, 'protein', targetProtein * 0.7);
    }

    // 2. Add carbohydrate source (aim for 60-70% of carb target)
    if (suitableFoods.carbs.length > 0 && targetCarbs > 0) {
      const carbFood = selectOptimalFood(suitableFoods.carbs, 'carbs', targetCarbs * 0.65);
      addFoodToMeal(carbFood, 'carbs', targetCarbs * 0.65);
    }

    // 3. Add healthy fat source (aim for 60-70% of fat target)
    if (suitableFoods.fats.length > 0 && targetFat > 0) {
      const fatFood = selectOptimalFood(suitableFoods.fats, 'fat', targetFat * 0.65);
      addFoodToMeal(fatFood, 'fat', targetFat * 0.65);
    }

    // 4. Add vegetables for micronutrients (small portion)
    if (suitableFoods.veggies.length > 0) {
      const veggieFood = selectOptimalFood(suitableFoods.veggies, 'protein', 0);
      addFoodToMeal(veggieFood, '', 0);
    }

    // 5. Add fruit if it's breakfast or snack
    if ((mealType === 'breakfast' || mealType === 'snack') && suitableFoods.fruits.length > 0) {
      const fruitFood = selectOptimalFood(suitableFoods.fruits, 'carbs', 0);
      addFoodToMeal(fruitFood, '', 0);
    }

  } catch (error) {
    console.error(`Error creating meal ${mealName}:`, error);
    // If we have any foods, continue with what we have
    if (mealFoods.length === 0) {
      throw new Error(`Failed to create meal ${mealName}: No suitable foods found`);
    }
  }

  const meal: Meal = {
    id: crypto.randomUUID(),
    name: mealName,
    foods: mealFoods,
    totalCalories: Math.round(currentCalories),
    totalProtein: Math.round(currentProtein),
    totalCarbs: Math.round(currentCarbs),
    totalFat: Math.round(currentFat)
  };

  console.log(`Created meal ${mealName}:`, {
    totalCalories: meal.totalCalories,
    totalProtein: meal.totalProtein,
    totalCarbs: meal.totalCarbs,
    totalFat: meal.totalFat,
    foodCount: meal.foods.length
  });

  return meal;
};

/**
 * Shuffles a meal by regenerating it with the same targets
 */
export const shuffleMeal = (
  meal: Meal,
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): Meal => {
  console.log(`Shuffling meal: ${meal.name}`);
  return createBalancedMeal(meal.name, targetCalories, targetProtein, targetCarbs, targetFat);
};
