
import { Food, Meal, MealFood, MealPlan, FoodCategory } from '@/types/food';
import { TDEEResult } from '@/components/fitness/TDEECalculator';
import { foodDatabase, getFoodById, getFoodsByCategory } from '@/data/foodDatabase';
import { v4 as uuidv4 } from 'uuid';

const createMeal = (
  name: string,
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): Meal => {
  // Select foods from each category
  const proteins = getFoodsByCategory('protein');
  const carbs = getFoodsByCategory('carbs');
  const fats = getFoodsByCategory('fats');
  const vegetables = getFoodsByCategory('vegetables');
  
  // Randomly select one from each required category
  const protein = proteins[Math.floor(Math.random() * proteins.length)];
  const carb = carbs[Math.floor(Math.random() * carbs.length)];
  const fat = fats[Math.floor(Math.random() * fats.length)];
  const vegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
  
  // Calculate portions to match macro targets
  // This is a simplified approach - in real-world, would need more complex algorithm
  const proteinPortion = Math.max(5, Math.round((targetProtein / protein.protein) * 100));
  const carbPortion = Math.max(5, Math.round((targetCarbs / carb.carbs) * 100));
  const fatPortion = Math.max(5, Math.round((targetFat / (fat.fat || 1)) * 100));
  // Vegetables are bonus, fixed portion
  const vegetablePortion = 100;
  
  const mealFoods: MealFood[] = [
    { food: protein, portionSize: proteinPortion },
    { food: carb, portionSize: carbPortion },
    { food: fat, portionSize: fatPortion },
    { food: vegetable, portionSize: vegetablePortion }
  ];
  
  // Calculate meal totals
  const totalCalories = mealFoods.reduce((sum, item) => 
    sum + (item.food.calories * (item.portionSize / 100)), 0);
  const totalProtein = mealFoods.reduce((sum, item) => 
    sum + (item.food.protein * (item.portionSize / 100)), 0);
  const totalCarbs = mealFoods.reduce((sum, item) => 
    sum + (item.food.carbs * (item.portionSize / 100)), 0);
  const totalFat = mealFoods.reduce((sum, item) => 
    sum + (item.food.fat * (item.portionSize / 100)), 0);
    
  return {
    id: uuidv4(),
    name,
    foods: mealFoods,
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein),
    totalCarbs: Math.round(totalCarbs),
    totalFat: Math.round(totalFat)
  };
};

export const generateMealPlan = (tdeeResult: TDEEResult): MealPlan => {
  const { adjustedCalories, proteinGrams, carbsGrams, fatsGrams, goal } = tdeeResult;
  
  // Create 4 meals with macro distribution
  // Breakfast: 25%, Lunch: 30%, Snack: 15%, Dinner: 30%
  const breakfastCalories = adjustedCalories * 0.25;
  const lunchCalories = adjustedCalories * 0.3;
  const snackCalories = adjustedCalories * 0.15;
  const dinnerCalories = adjustedCalories * 0.3;
  
  const breakfast = createMeal(
    'Breakfast', 
    breakfastCalories, 
    proteinGrams * 0.25,
    carbsGrams * 0.25,
    fatsGrams * 0.25
  );
  
  const lunch = createMeal(
    'Lunch', 
    lunchCalories, 
    proteinGrams * 0.3,
    carbsGrams * 0.3,
    fatsGrams * 0.3
  );
  
  const snack = createMeal(
    'Snack', 
    snackCalories, 
    proteinGrams * 0.15,
    carbsGrams * 0.15,
    fatsGrams * 0.15
  );
  
  const dinner = createMeal(
    'Dinner', 
    dinnerCalories, 
    proteinGrams * 0.3,
    carbsGrams * 0.3,
    fatsGrams * 0.3
  );
  
  const meals = [breakfast, lunch, snack, dinner];
  
  // Calculate totals
  const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  
  // Calculate hydration (35ml per kg of body weight)
  // Note: This would typically use the actual weight, but as an approximation:
  // Roughly estimate weight from TDEE: TDEE/15 for an average person
  const estimatedWeight = Math.round(tdeeResult.tdee / 15);
  const hydrationTarget = estimatedWeight * 35;
  
  return {
    id: uuidv4(),
    goal,
    totalCalories,
    targetProtein: proteinGrams,
    targetCarbs: carbsGrams,
    targetFat: fatsGrams,
    meals,
    hydrationTarget
  };
};

export const shuffleMeal = (meal: Meal, targetProtein: number, targetCarbs: number, targetFat: number): Meal => {
  return createMeal(
    meal.name,
    meal.totalCalories,
    targetProtein,
    targetCarbs,
    targetFat
  );
};

export const replaceFoodInMeal = (meal: Meal, oldFoodId: string, newFoodId: string): Meal => {
  const newFood = getFoodById(newFoodId);
  if (!newFood) return meal;
  
  const updatedFoods = meal.foods.map(mealFood => {
    if (mealFood.food.id === oldFoodId) {
      // Calculate new portion size to maintain similar macros
      const oldFood = mealFood.food;
      const oldNutrients = {
        calories: oldFood.calories * (mealFood.portionSize / 100),
        protein: oldFood.protein * (mealFood.portionSize / 100),
        carbs: oldFood.carbs * (mealFood.portionSize / 100),
        fat: oldFood.fat * (mealFood.portionSize / 100)
      };
      
      // Adjust portion size to match nutrients (prioritize protein)
      let newPortionSize = 100;
      if (newFood.protein > 0) {
        newPortionSize = (oldNutrients.protein / newFood.protein) * 100;
      }
      
      return { food: newFood, portionSize: Math.max(10, Math.round(newPortionSize)) };
    }
    return mealFood;
  });
  
  // Recalculate meal totals
  const totalCalories = updatedFoods.reduce((sum, item) => 
    sum + (item.food.calories * (item.portionSize / 100)), 0);
  const totalProtein = updatedFoods.reduce((sum, item) => 
    sum + (item.food.protein * (item.portionSize / 100)), 0);
  const totalCarbs = updatedFoods.reduce((sum, item) => 
    sum + (item.food.carbs * (item.portionSize / 100)), 0);
  const totalFat = updatedFoods.reduce((sum, item) => 
    sum + (item.food.fat * (item.portionSize / 100)), 0);
    
  return {
    ...meal,
    foods: updatedFoods,
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein),
    totalCarbs: Math.round(totalCarbs),
    totalFat: Math.round(totalFat)
  };
};

export const getMealStats = (meal: Meal) => {
  return {
    calories: meal.totalCalories,
    protein: meal.totalProtein,
    carbs: meal.totalCarbs,
    fat: meal.totalFat,
    foods: meal.foods.length
  };
};
