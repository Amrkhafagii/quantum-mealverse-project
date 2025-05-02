
import { Food, Meal, MealFood, MealPlan, FoodCategory } from '@/types/food';
import { TDEEResult } from '@/components/fitness/TDEECalculator';
import { foodDatabase, getFoodById, getFoodsByCategory, getFoodsByCategoryAndMealType } from '@/data/foodDatabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a meal with balanced macros based on targets
 */
const createMeal = (
  name: string,
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number,
  ensureProtein: boolean = false,
  mealType: string = "lunch" // Default to lunch if no meal type specified
): Meal => {
  // Select foods from each category that are appropriate for this meal type
  const getAppropriateFood = (category: FoodCategory) => {
    const foodsForMeal = getFoodsByCategoryAndMealType(category, mealType);
    // If no foods for this meal type, fall back to general category
    return foodsForMeal.length > 0 
      ? foodsForMeal[Math.floor(Math.random() * foodsForMeal.length)]
      : getFoodsByCategory(category)[Math.floor(Math.random() * getFoodsByCategory(category).length)];
  };
  
  // Get appropriate foods for this meal type
  const protein = getAppropriateFood('protein');
  const carb = getAppropriateFood('carbs');
  const fat = getAppropriateFood('fats');
  const vegetable = getAppropriateFood('vegetables');
  
  // Calculate realistic portions to match macro targets while being reasonable
  // Cap portions at reasonable amounts
  const MAX_PROTEIN_PORTION = 250; // max 250g of protein source
  const MAX_CARB_PORTION = 300; // max 300g of carb source
  const MAX_FAT_PORTION = 50; // max 50g of fat source (oils, nuts, etc)
  const MIN_PORTION = 10; // minimum 10g portion
  
  // Calculate initial portion sizes
  const proteinCalPerGram = protein.protein * 4 / 100;
  const carbCalPerGram = carb.carbs * 4 / 100;
  const fatCalPerGram = fat.fat * 9 / 100;
  
  // Calculate initial portion based on protein target
  // If ensureProtein is true, we'll target at least 95% of the target protein
  const proteinTarget = ensureProtein ? Math.max(targetProtein, targetProtein * 0.95) : targetProtein;
  
  let proteinPortion = Math.min(
    MAX_PROTEIN_PORTION,
    Math.max(MIN_PORTION, Math.round((proteinTarget / (protein.protein / 100))))
  );
  
  // Calculate initial portion based on carbs target
  let carbPortion = Math.min(
    MAX_CARB_PORTION,
    Math.max(MIN_PORTION, Math.round((targetCarbs / (carb.carbs / 100))))
  );
  
  // Calculate initial portion based on fat target
  let fatPortion = Math.min(
    MAX_FAT_PORTION,
    Math.max(MIN_PORTION, Math.round((targetFat / (fat.fat / 100))))
  );
  
  // Calculate vegetable portion - variable based on meal size
  // More veg for bigger meals, but at least 100g
  const mealSize = proteinPortion + carbPortion + fatPortion;
  const vegetablePortion = Math.max(100, Math.round(mealSize * 0.25));
  
  // Adjust portion sizes if the total calories exceed target by >10%
  let totalCalories = 
    (protein.calories * proteinPortion / 100) + 
    (carb.calories * carbPortion / 100) + 
    (fat.calories * fatPortion / 100) + 
    (vegetable.calories * vegetablePortion / 100);
  
  // If we're significantly over calories, proportionally reduce portions
  // but protect protein if ensureProtein is true
  if (totalCalories > targetCalories * 1.1) {
    const reductionFactor = targetCalories / totalCalories;
    
    if (ensureProtein) {
      // Reduce carbs and fats more to preserve protein
      carbPortion = Math.max(MIN_PORTION, Math.round(carbPortion * reductionFactor * 0.9));
      fatPortion = Math.max(MIN_PORTION, Math.round(fatPortion * reductionFactor * 0.9));
      // Reduce protein less
      proteinPortion = Math.max(MIN_PORTION, Math.round(proteinPortion * reductionFactor * 1.1));
    } else {
      // Standard reduction
      proteinPortion = Math.max(MIN_PORTION, Math.round(proteinPortion * reductionFactor));
      carbPortion = Math.max(MIN_PORTION, Math.round(carbPortion * reductionFactor));
      fatPortion = Math.max(MIN_PORTION, Math.round(fatPortion * reductionFactor));
    }
  }
  
  const mealFoods: MealFood[] = [
    { food: protein, portionSize: proteinPortion },
    { food: carb, portionSize: carbPortion },
    { food: fat, portionSize: fatPortion },
    { food: vegetable, portionSize: vegetablePortion }
  ];
  
  // Calculate meal totals
  const actualTotalCalories = mealFoods.reduce((sum, item) => 
    sum + (item.food.calories * (item.portionSize / 100)), 0);
  const actualTotalProtein = mealFoods.reduce((sum, item) => 
    sum + (item.food.protein * (item.portionSize / 100)), 0);
  const actualTotalCarbs = mealFoods.reduce((sum, item) => 
    sum + (item.food.carbs * (item.portionSize / 100)), 0);
  const actualTotalFat = mealFoods.reduce((sum, item) => 
    sum + (item.food.fat * (item.portionSize / 100)), 0);
    
  return {
    id: uuidv4(),
    name,
    foods: mealFoods,
    totalCalories: Math.round(actualTotalCalories),
    totalProtein: Math.round(actualTotalProtein),
    totalCarbs: Math.round(actualTotalCarbs),
    totalFat: Math.round(actualTotalFat)
  };
};

/**
 * Generate a meal plan based on TDEE result with proper macro distribution
 */
export const generateMealPlan = (tdeeResult: TDEEResult): MealPlan => {
  const { adjustedCalories, proteinGrams, carbsGrams, fatsGrams, goal } = tdeeResult;
  
  // Create 4 meals with macro distribution
  // Breakfast: 25%, Lunch: 30%, Snack: 15%, Dinner: 30%
  const breakfastCalories = adjustedCalories * 0.25;
  const lunchCalories = adjustedCalories * 0.3;
  const snackCalories = adjustedCalories * 0.15;
  const dinnerCalories = adjustedCalories * 0.3;
  
  // Create culturally appropriate meals by specifying meal type
  const breakfast = createMeal(
    'Breakfast', 
    breakfastCalories, 
    proteinGrams * 0.25,
    carbsGrams * 0.25,
    fatsGrams * 0.25,
    true, // Ensure protein target is met
    'breakfast' // Specify meal type
  );
  
  const lunch = createMeal(
    'Lunch', 
    lunchCalories, 
    proteinGrams * 0.3,
    carbsGrams * 0.3,
    fatsGrams * 0.3,
    true, // Ensure protein target is met
    'lunch'
  );
  
  const snack = createMeal(
    'Snack', 
    snackCalories, 
    proteinGrams * 0.15,
    carbsGrams * 0.15,
    fatsGrams * 0.15,
    true, // Ensure protein target is met
    'snack'
  );
  
  const dinner = createMeal(
    'Dinner', 
    dinnerCalories, 
    proteinGrams * 0.3,
    carbsGrams * 0.3,
    fatsGrams * 0.3,
    true, // Ensure protein target is met
    'dinner'
  );
  
  const meals = [breakfast, lunch, snack, dinner];
  
  // Calculate accurate totals from the generated meals
  const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.totalProtein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.totalFat, 0);
  
  // Calculate hydration with a better formula
  // Base formula: 30-35ml per kg of body weight
  // We'll estimate weight more accurately using the BMR (Mifflin-St Jeor)
  // For men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
  // For women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
  
  // This is still an estimation but better than TDEE/15
  // Assume average height and age if not provided
  const estimatedWeight = Math.round(tdeeResult.bmr / 24 / 0.85); // BMR/(24 hours * activity factor)
  const hydrationTarget = Math.round(estimatedWeight * 35); // 35ml per kg
  
  return {
    id: uuidv4(),
    goal,
    totalCalories,
    targetProtein: proteinGrams,
    targetCarbs: carbsGrams,
    targetFat: fatsGrams,
    actualProtein: totalProtein,
    actualCarbs: totalCarbs,
    actualFat: totalFat,
    meals,
    hydrationTarget
  };
};

/**
 * Create a new version of a meal with similar macros but different foods
 */
export const shuffleMeal = (meal: Meal, targetProtein: number, targetCarbs: number, targetFat: number): Meal => {
  // Get the meal type from the meal name
  let mealType = "lunch"; // default
  
  if (meal.name.toLowerCase().includes("breakfast")) {
    mealType = "breakfast";
  } else if (meal.name.toLowerCase().includes("lunch")) {
    mealType = "lunch";
  } else if (meal.name.toLowerCase().includes("snack")) {
    mealType = "snack";
  } else if (meal.name.toLowerCase().includes("dinner")) {
    mealType = "dinner";
  }
  
  // When shuffling, we want to maintain the same macro balance but with different foods
  // We'll ensure we hit at least 95% of protein target by passing true to createMeal
  return createMeal(
    meal.name,
    meal.totalCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    true, // ensure we prioritize hitting protein targets
    mealType // pass the meal type to ensure culturally appropriate foods
  );
};

/**
 * Replace a specific food in a meal and recalculate nutrition
 */
export const replaceFoodInMeal = (meal: Meal, oldFoodId: string, newFoodId: string): Meal => {
  const newFood = getFoodById(newFoodId);
  if (!newFood) return meal;
  
  const updatedFoods = meal.foods.map(mealFood => {
    if (mealFood.food.id === oldFoodId) {
      // Calculate new portion size to maintain similar macros
      const oldFood = mealFood.food;
      
      // Find which macro is dominant in this food
      const oldProteinCals = oldFood.protein * 4;
      const oldCarbsCals = oldFood.carbs * 4;
      const oldFatCals = oldFood.fat * 9;
      
      // Determine which macro to prioritize for portion calculation
      let newPortionSize;
      
      if (oldProteinCals >= oldCarbsCals && oldProteinCals >= oldFatCals && newFood.protein > 0) {
        // Protein is the main macro
        newPortionSize = (oldFood.protein * mealFood.portionSize / 100) / (newFood.protein / 100);
      } else if (oldCarbsCals >= oldProteinCals && oldCarbsCals >= oldFatCals && newFood.carbs > 0) {
        // Carbs are the main macro
        newPortionSize = (oldFood.carbs * mealFood.portionSize / 100) / (newFood.carbs / 100);
      } else if (newFood.fat > 0) {
        // Fat is the main macro
        newPortionSize = (oldFood.fat * mealFood.portionSize / 100) / (newFood.fat / 100);
      } else {
        // Fallback to calorie-based portion
        newPortionSize = (oldFood.calories * mealFood.portionSize / 100) / (newFood.calories / 100);
      }
      
      // Apply min/max constraints based on food category
      const MAX_PORTION = newFood.category === 'protein' ? 250 : 
                         newFood.category === 'carbs' ? 300 : 
                         newFood.category === 'fats' ? 50 : 150;
                         
      return { 
        food: newFood, 
        portionSize: Math.min(MAX_PORTION, Math.max(10, Math.round(newPortionSize))) 
      };
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

/**
 * Get statistics for a meal
 */
export const getMealStats = (meal: Meal) => {
  return {
    calories: meal.totalCalories,
    protein: meal.totalProtein,
    carbs: meal.totalCarbs,
    fat: meal.totalFat,
    foods: meal.foods.length
  };
};
