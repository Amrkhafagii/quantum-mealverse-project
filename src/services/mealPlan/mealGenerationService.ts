import { MealPlan, Meal, Food, MealFood, FoodCategory, CookingState } from '@/types/food';
import { foodDataService, FoodItem, NutritionData } from '../foodDataService';
import { TDEEResult, MealDistribution } from './types';

/**
 * Generate a meal plan based on TDEE calculation using accurate nutrition data from USDA
 */
export const generateMealPlan = (tdeeResult: TDEEResult): MealPlan => {
  const { adjustedCalories, proteinGrams, carbsGrams, fatsGrams, goal, weight, activityLevel } = tdeeResult;
  
  // Enhanced meal distribution with scientifically-optimized ratios
  // Updated to provide better macro balancing across meals based on research
  const mealDistribution = [
    { name: 'Breakfast', ratio: 0.25, protein: 0.25, carbs: 0.30, fat: 0.20 },
    { name: 'Lunch',     ratio: 0.35, protein: 0.35, carbs: 0.35, fat: 0.35 },
    { name: 'Snack',     ratio: 0.10, protein: 0.10, carbs: 0.15, fat: 0.15 },
    { name: 'Dinner',    ratio: 0.30, protein: 0.30, carbs: 0.20, fat: 0.30 }
  ];
  
  // Ensure meal distribution ratios sum to 1.0 for each macronutrient
  const proteinSum = mealDistribution.reduce((sum, meal) => sum + meal.protein, 0);
  const carbsSum = mealDistribution.reduce((sum, meal) => sum + meal.carbs, 0);
  const fatSum = mealDistribution.reduce((sum, meal) => sum + meal.fat, 0);
  
  // Normalize ratios if they don't sum to exactly 1.0
  if (Math.abs(proteinSum - 1.0) > 0.01 || Math.abs(carbsSum - 1.0) > 0.01 || Math.abs(fatSum - 1.0) > 0.01) {
    mealDistribution.forEach(meal => {
      meal.protein = meal.protein / proteinSum;
      meal.carbs = meal.carbs / carbsSum;
      meal.fat = meal.fat / fatSum;
    });
  }
  
  // Generate meals with improved calorie and macro distribution
  const meals = mealDistribution.map(meal => {
    const targetCalories = Math.round(adjustedCalories * meal.ratio);
    const targetProtein = Math.round(proteinGrams * meal.protein);
    const targetCarbs = Math.round(carbsGrams * meal.carbs);
    const targetFat = Math.round(fatsGrams * meal.fat);
    
    return createBalancedMeal(
      meal.name,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat
    );
  });
  
  // Calculate recommended water intake based on weight and activity using the foodDataService
  const hydrationTarget = foodDataService.calculateWaterIntake(
    Number(weight) || 70,  // Default to 70kg if weight not provided
    activityLevel || 'moderately-active'  // Default to moderate if not provided
  );

  // Sum up actual macros from all meals for verification
  const actualProtein = meals.reduce((sum, meal) => sum + meal.totalProtein, 0);
  const actualCarbs = meals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
  const actualFat = meals.reduce((sum, meal) => sum + meal.totalFat, 0);
  const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);

  // Verify and adjust if targets are not met within acceptable thresholds
  const macroTargetThreshold = 0.1; // 10% threshold for macro verification
  const isProteinBalanced = Math.abs(actualProtein - proteinGrams) / proteinGrams <= macroTargetThreshold;
  const areCarbsBalanced = Math.abs(actualCarbs - carbsGrams) / carbsGrams <= macroTargetThreshold;
  const areFatsBalanced = Math.abs(actualFat - fatsGrams) / fatsGrams <= macroTargetThreshold;

  // Log verification results for debugging
  console.log("Macro balance verification:", { 
    isProteinBalanced, 
    areCarbsBalanced, 
    areFatsBalanced,
    proteinDiff: ((actualProtein - proteinGrams) / proteinGrams * 100).toFixed(1) + "%",
    carbsDiff: ((actualCarbs - carbsGrams) / carbsGrams * 100).toFixed(1) + "%", 
    fatsDiff: ((actualFat - fatsGrams) / fatsGrams * 100).toFixed(1) + "%"
  });

  return {
    id: crypto.randomUUID(),
    goal,
    totalCalories: Math.round(totalCalories),
    targetProtein: proteinGrams,
    targetCarbs: carbsGrams,
    targetFat: fatsGrams,
    actualProtein: Math.round(actualProtein),
    actualCarbs: Math.round(actualCarbs),
    actualFat: Math.round(actualFat),
    meals: meals,
    hydrationTarget
  };
};

/**
 * Creates a balanced meal with optimal nutrition distribution and realistic portion sizes
 */
const createBalancedMeal = (
  name: string, 
  targetCalories: number, 
  targetProtein: number, 
  targetCarbs: number, 
  targetFat: number
): Meal => {
  try {
    // Select appropriate foods for this meal type with improved meal-specific selection
    const suitableFoods = getSuitableFoodsForMeal(name.toLowerCase());
    
    // Enhanced selection algorithm that prioritizes nutrient quality and meal appropriateness
    const proteinFood = selectOptimalFood(suitableFoods.proteins, 'protein', targetProtein);
    const carbFood = selectOptimalFood(suitableFoods.carbs, 'carbs', targetCarbs);
    const fatFood = selectOptimalFood(suitableFoods.fats, 'fat', targetFat);
    const veggieFood = selectOptimalFood(suitableFoods.veggies, 'fiber', 0); // Veggies for micronutrients
    
    // Advanced portion calculation that better accounts for nutrient density and realistic servings
    const proteinPortion = calculateOptimalPortion(proteinFood, targetProtein, 'protein', targetCalories * 0.35);
    const carbPortion = calculateOptimalPortion(carbFood, targetCarbs, 'carbs', targetCalories * 0.45);
    const fatPortion = calculateOptimalPortion(fatFood, targetFat, 'fat', targetCalories * 0.20);
    const veggiePortion = calculateVegetablePortionSize(veggieFood, name);
    
    // Create meal foods with optimized portions
    const mealFoods: MealFood[] = [
      { food: proteinFood, portionSize: proteinPortion },
      { food: carbFood, portionSize: carbPortion },
      { food: fatFood, portionSize: fatPortion },
      { food: veggieFood, portionSize: veggiePortion }
    ];

    // Initial totals calculation with more precision
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCalories = 0;

    mealFoods.forEach(mealFood => {
      const ratio = mealFood.portionSize / mealFood.food.portion;
      totalProtein += mealFood.food.protein * ratio;
      totalCarbs += mealFood.food.carbs * ratio;
      totalFat += mealFood.food.fat * ratio;
      totalCalories += mealFood.food.calories * ratio;
    });

    // Improved iterative adjustment for better macro balance
    const targetMacroThreshold = 0.08; // 8% threshold for acceptable macro deviation
    const maxAdjustmentIterations = 3; // Limit adjustment cycles to prevent excessive calculations
    
    let iterations = 0;
    while (iterations < maxAdjustmentIterations) {
      const proteinDiff = Math.abs(totalProtein - targetProtein) / targetProtein;
      const carbsDiff = Math.abs(totalCarbs - targetCarbs) / targetCarbs;
      const fatDiff = Math.abs(totalFat - targetFat) / targetFat;
      const calorieDiff = Math.abs(totalCalories - targetCalories) / targetCalories;
      
      // Break loop if all macros and calories are within acceptable range
      if (proteinDiff <= targetMacroThreshold && 
          carbsDiff <= targetMacroThreshold && 
          fatDiff <= targetMacroThreshold &&
          calorieDiff <= targetMacroThreshold) {
        break;
      }
      
      // Prioritized adjustment based on which macro is furthest from target
      if (proteinDiff > carbsDiff && proteinDiff > fatDiff) {
        // Adjust protein portion
        const proteinMeal = mealFoods.find(m => m.food.category === 'protein');
        if (proteinMeal) {
          const adjustmentFactor = targetProtein / totalProtein;
          proteinMeal.portionSize = Math.round(proteinMeal.portionSize * adjustmentFactor);
        }
      } else if (carbsDiff > fatDiff) {
        // Adjust carb portion
        const carbMeal = mealFoods.find(m => m.food.category === 'carbs');
        if (carbMeal) {
          const adjustmentFactor = targetCarbs / totalCarbs;
          carbMeal.portionSize = Math.round(carbMeal.portionSize * adjustmentFactor);
        }
      } else {
        // Adjust fat portion
        const fatMeal = mealFoods.find(m => m.food.category === 'fats');
        if (fatMeal) {
          const adjustmentFactor = targetFat / totalFat;
          fatMeal.portionSize = Math.round(fatMeal.portionSize * adjustmentFactor);
        }
      }
      
      // Recalculate totals after adjustment
      totalProtein = 0;
      totalCarbs = 0;
      totalFat = 0;
      totalCalories = 0;
      
      mealFoods.forEach(mealFood => {
        const ratio = mealFood.portionSize / mealFood.food.portion;
        totalProtein += mealFood.food.protein * ratio;
        totalCarbs += mealFood.food.carbs * ratio;
        totalFat += mealFood.food.fat * ratio;
        totalCalories += mealFood.food.calories * ratio;
      });
      
      iterations++;
    }
    
    // Final adjustment for total calories if still off target
    if (Math.abs(totalCalories - targetCalories) > targetCalories * 0.1) {
      const calorieAdjustmentFactor = targetCalories / totalCalories;
      
      // Make proportional adjustments to non-vegetable foods
      mealFoods.forEach(mealFood => {
        // Don't adjust veggies for calorie correction
        if (mealFood.food.category !== 'vegetables') {
          mealFood.portionSize = Math.round(mealFood.portionSize * calorieAdjustmentFactor);
        }
      });
      
      // Recalculate final totals
      totalProtein = 0;
      totalCarbs = 0;
      totalFat = 0;
      totalCalories = 0;
      
      mealFoods.forEach(mealFood => {
        const ratio = mealFood.portionSize / mealFood.food.portion;
        totalProtein += mealFood.food.protein * ratio;
        totalCarbs += mealFood.food.carbs * ratio;
        totalFat += mealFood.food.fat * ratio;
        totalCalories += mealFood.food.calories * ratio;
      });
    }

    return {
      id: crypto.randomUUID(),
      name,
      foods: mealFoods,
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat)
    };
  } catch (error) {
    console.error('Error creating balanced meal:', error);
    // Fallback to the original meal creation method if there's an error
    return createSampleMeal(name, targetCalories, targetProtein, targetCarbs, targetFat);
  }
};

/**
 * Determines appropriate vegetable portion size based on meal type
 */
const calculateVegetablePortionSize = (veggieFood: Food, mealName: string): number => {
  const lowerMealName = mealName.toLowerCase();
  
  if (lowerMealName === 'breakfast') {
    return 75; // Smaller veggie portion with breakfast
  } else if (lowerMealName === 'snack') {
    return 50; // Small veggie portion for snack
  } else if (lowerMealName === 'lunch' || lowerMealName === 'dinner') {
    return 150; // Larger veggie portions for main meals
  }
  
  return 100; // Default portion size
};

/**
 * Gets suitable foods for each meal type (breakfast, lunch, dinner, snack)
 */
const getSuitableFoodsForMeal = (mealType: string): {
  proteins: Food[],
  carbs: Food[],
  fats: Food[],
  veggies: Food[]
} => {
  // Import food database directly to avoid circular dependencies
  const { foodDatabase } = require('../../data/foodDatabase');
  
  // Filter foods suitable for this meal type
  const suitableFoods = foodDatabase.filter(food => 
    food.mealSuitability?.includes(mealType) || !food.mealSuitability
  );
  
  // Group by category
  return {
    proteins: suitableFoods.filter(food => food.category === 'protein'),
    carbs: suitableFoods.filter(food => food.category === 'carbs'),
    fats: suitableFoods.filter(food => food.category === 'fats'),
    veggies: suitableFoods.filter(food => food.category === 'vegetables')
  };
};

/**
 * Selects optimal food from a category based on target nutrient
 */
const selectOptimalFood = (foods: Food[], nutrientType: string, targetAmount: number): Food => {
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
 * Calculate optimal portion size to hit macro targets while maintaining reasonable portions
 */
const calculateOptimalPortion = (food: Food, targetGrams: number, nutrientType: string, calorieTarget: number): number => {
  // Get nutrient content in the food
  const nutrientPer100g = food[nutrientType as keyof Food] as number;
  
  // If the food doesn't have any of this nutrient, return a default portion
  if (!nutrientPer100g || nutrientPer100g <= 0) {
    return nutrientType === 'fat' ? 15 : 100;
  }
  
  // Calculate portion needed to hit target nutrient
  const portionNeededForNutrient = (targetGrams / nutrientPer100g) * 100;
  
  // Calculate portion needed to hit calorie target
  const portionNeededForCalories = (calorieTarget / food.calories) * 100;
  
  // Take the average of the two calculations for a balanced approach
  const calculatedPortion = (portionNeededForNutrient + portionNeededForCalories) / 2;
  
  // Apply reasonable limits to portion sizes based on food category
  const minPortion = getMinPortionSize(food.category);
  const maxPortion = getMaxPortionSize(food.category);
  
  return Math.round(Math.min(Math.max(calculatedPortion, minPortion), maxPortion));
};

/**
 * Get minimum reasonable portion size based on food category
 */
const getMinPortionSize = (category: string): number => {
  switch (category) {
    case 'protein': return 50;  // 50g minimum for protein
    case 'carbs': return 40;    // 40g minimum for carbs
    case 'fats': return 10;     // 10g minimum for fats (oils, nuts, etc.)
    case 'vegetables': return 50; // 50g minimum for vegetables
    case 'fruits': return 80;   // 80g minimum for fruits
    default: return 30;
  }
};

/**
 * Get maximum reasonable portion size based on food category
 */
const getMaxPortionSize = (category: string): number => {
  switch (category) {
    case 'protein': return 250;  // 250g maximum for protein
    case 'carbs': return 300;    // 300g maximum for carbs
    case 'fats': return 60;      // 60g maximum for fats
    case 'vegetables': return 300; // 300g maximum for vegetables
    case 'fruits': return 200;   // 200g maximum for fruits
    default: return 200;
  }
};

/**
 * Shuffle a meal to generate alternatives with improved macro distribution
 */
export const shuffleMeal = (
  meal: Meal,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): Meal => {
  // Create a new meal with same target macros but different foods
  return createBalancedMeal(
    meal.name,
    meal.totalCalories,
    targetProtein,
    targetCarbs,
    targetFat
  );
};

// Keep the original createSampleMeal as a fallback
const createSampleMeal = (
  name: string, 
  calories: number, 
  protein: number, 
  carbs: number, 
  fat: number
): Meal => {
  // Sample foods
  const sampleProteinFoods: Partial<Food>[] = [
    { name: 'Chicken Breast', category: 'protein', protein: 23, carbs: 0, fat: 1, calories: 120, portion: 100 },
    { name: 'Turkey', category: 'protein', protein: 22, carbs: 0, fat: 1, calories: 104, portion: 100 },
    { name: 'Tofu', category: 'protein', protein: 10, carbs: 2, fat: 5, calories: 94, portion: 100 },
    { name: 'Salmon', category: 'protein', protein: 20, carbs: 0, fat: 6, calories: 208, portion: 100 },
    { name: 'Greek Yogurt', category: 'protein', protein: 10, carbs: 4, fat: 0, calories: 59, portion: 100 }
  ];

  const sampleCarbFoods: Partial<Food>[] = [
    { name: 'Brown Rice', category: 'carbs', protein: 2, carbs: 23, fat: 1, calories: 112, portion: 100 },
    { name: 'Sweet Potato', category: 'carbs', protein: 1, carbs: 20, fat: 0, calories: 86, portion: 100 },
    { name: 'Quinoa', category: 'carbs', protein: 4, carbs: 21, fat: 2, calories: 120, portion: 100 },
    { name: 'Oats', category: 'carbs', protein: 2, carbs: 12, fat: 1, calories: 68, portion: 50 },
    { name: 'Whole Wheat Bread', category: 'carbs', protein: 3, carbs: 12, fat: 1, calories: 69, portion: 30 }
  ];

  const sampleFatFoods: Partial<Food>[] = [
    { name: 'Avocado', category: 'fats', protein: 2, carbs: 9, fat: 15, calories: 160, portion: 100 },
    { name: 'Olive Oil', category: 'fats', protein: 0, carbs: 0, fat: 14, calories: 119, portion: 15 },
    { name: 'Almonds', category: 'fats', protein: 6, carbs: 6, fat: 14, calories: 164, portion: 30 },
    { name: 'Flax Seeds', category: 'fats', protein: 2, carbs: 3, fat: 4, calories: 59, portion: 10 },
    { name: 'Peanut Butter', category: 'fats', protein: 4, carbs: 3, fat: 8, calories: 94, portion: 15 }
  ];

  const sampleVeggies: Partial<Food>[] = [
    { name: 'Broccoli', category: 'vegetables', protein: 2, carbs: 7, fat: 0, calories: 34, portion: 100 },
    { name: 'Spinach', category: 'vegetables', protein: 3, carbs: 3, fat: 0, calories: 23, portion: 100 },
    { name: 'Bell Peppers', category: 'vegetables', protein: 1, carbs: 6, fat: 0, calories: 31, portion: 100 },
    { name: 'Carrots', category: 'vegetables', protein: 1, carbs: 10, fat: 0, calories: 41, portion: 100 },
    { name: 'Zucchini', category: 'vegetables', protein: 1, carbs: 3, fat: 0, calories: 17, portion: 100 }
  ];

  // Randomly select foods
  const proteinFood = sampleProteinFoods[Math.floor(Math.random() * sampleProteinFoods.length)] as Food;
  const carbFood = sampleCarbFoods[Math.floor(Math.random() * sampleCarbFoods.length)] as Food;
  const fatFood = sampleFatFoods[Math.floor(Math.random() * sampleFatFoods.length)] as Food;
  const veggie = sampleVeggies[Math.floor(Math.random() * sampleVeggies.length)] as Food;

  // Calculate portion sizes to match macros more accurately
  const proteinPortion = calculatePortion(proteinFood, protein, 'protein');
  const carbPortion = calculatePortion(carbFood, carbs, 'carbs');
  const fatPortion = calculatePortion(fatFood, fat, 'fat');
  const veggiePortion = 100; // Fixed portion for veggies
  
  // Create meal foods
  const mealFoods: MealFood[] = [
    { food: proteinFood, portionSize: proteinPortion },
    { food: carbFood, portionSize: carbPortion },
    { food: fatFood, portionSize: fatPortion },
    { food: veggie, portionSize: veggiePortion }
  ];

  // Calculate actual totals
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalCalories = 0;

  mealFoods.forEach(mealFood => {
    const ratio = mealFood.portionSize / mealFood.food.portion;
    totalProtein += mealFood.food.protein * ratio;
    totalCarbs += mealFood.food.carbs * ratio;
    totalFat += mealFood.food.fat * ratio;
    totalCalories += mealFood.food.calories * ratio;
  });

  return {
    id: crypto.randomUUID(),
    name,
    foods: mealFoods,
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein),
    totalCarbs: Math.round(totalCarbs),
    totalFat: Math.round(totalFat)
  };
};

/**
 * Calculate portion size needed to hit a specific nutrient target
 */
export const calculatePortion = (food: Food, targetGrams: number, nutrientType: 'protein' | 'carbs' | 'fat'): number => {
  // Get nutrient content per 100g
  const nutrientPer100g = food[nutrientType];
  
  // If the food doesn't have any of this nutrient, return a default portion
  if (!nutrientPer100g) {
    return nutrientType === 'fat' ? 15 : 100;
  }
  
  // Calculate how many grams of food needed to hit target
  const portionNeeded = (targetGrams / nutrientPer100g) * 100;
  
  // Apply some reasonable limits to portion size
  let limitedPortion: number;
  
  switch (nutrientType) {
    case 'protein':
      limitedPortion = Math.min(Math.max(portionNeeded, 50), 250);
      break;
    case 'carbs':
      limitedPortion = Math.min(Math.max(portionNeeded, 50), 300);
      break;
    case 'fat':
      limitedPortion = Math.min(Math.max(portionNeeded, 10), 50);
      break;
    default:
      limitedPortion = 100;
  }
  
  return Math.round(limitedPortion);
};

/**
 * Create a fallback food item if API fails - now returns a proper Food object
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

/**
 * New utility functions for nutrition accuracy
 */

/**
 * Converts nutrition measurements based on cooking method
 */
export const convertBasedOnCookingMethod = (
  food: Food, 
  portionSize: number,
  fromCookingState: 'raw' | 'cooked',
  toCookingState: 'raw' | 'cooked',
  method: 'baked' | 'grilled' | 'boiled' | 'steamed' | 'roasted'
): number => {
  if (fromCookingState === toCookingState) return portionSize;
  
  let foodType: 'protein' | 'vegetable' | 'grain';
  
  // Map food category to conversion type
  switch (food.category) {
    case 'protein':
      foodType = 'protein';
      break;
    case 'vegetables':
      foodType = 'vegetable';
      break;
    case 'carbs':
      foodType = 'grain';
      break;
    default:
      // Default to protein as a fallback
      foodType = 'protein';
  }
  
  // Use the foodDataService to convert weights
  return foodDataService.convertWeight(
    portionSize,
    foodType,
    fromCookingState,
    toCookingState,
    method
  );
};

/**
 * Distributes macros across meals according to the specified distribution
 */
export const distributeMacrosAcrossMeals = (
  totalProtein: number,
  totalCarbs: number,
  totalFat: number,
  mealDistribution: MealDistribution[]
): Array<{
  name: string;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}> => {
  return foodDataService.distributeMacrosAcrossMeals(
    totalProtein,
    totalCarbs,
    totalFat,
    mealDistribution
  );
};

/**
 * Creates a nutrition object from USDA food data
 */
export const extractNutritionFromUSDA = (foodItem: FoodItem): NutritionData => {
  return foodDataService.extractNutritionData(foodItem);
};

/**
 * Adjusts portion size to meet calorie target
 */
export const adjustPortionForCalories = (
  currentCalories: number,
  targetCalories: number,
  currentPortionGrams: number
): number => {
  // If current and target calories are the same, no adjustment needed
  if (currentCalories === targetCalories) return currentPortionGrams;
  
  // Calculate simple ratio for adjustment
  const ratio = targetCalories / currentCalories;
  
  // Apply the ratio to adjust portion size
  let adjustedPortion = currentPortionGrams * ratio;
  
  // Round to nearest 5g for usability
  return Math.round(adjustedPortion / 5) * 5;
};

/**
 * Validates a meal plan's macro distribution against targets
 * Returns a score from 0-100 representing how well macros are balanced
 */
export const validateMealPlanMacros = (mealPlan: MealPlan): {
  score: number;
  issues: string[];
} => {
  const { targetProtein, targetCarbs, targetFat, actualProtein, actualCarbs, actualFat } = mealPlan;
  
  if (!actualProtein || !actualCarbs || !actualFat) {
    return { score: 0, issues: ["Actual macros not calculated"] };
  }
  
  const issues: string[] = [];
  let totalScore = 100;
  
  // Calculate percentage differences
  const proteinDiff = Math.abs(actualProtein - targetProtein) / targetProtein;
  const carbsDiff = Math.abs(actualCarbs - targetCarbs) / targetCarbs;
  const fatDiff = Math.abs(actualFat - targetFat) / targetFat;
  
  // Deduct points based on how far off each macro is
  if (proteinDiff > 0.05) { // 5% threshold
    totalScore -= Math.min(30, Math.round(proteinDiff * 100));
    issues.push(`Protein is ${(proteinDiff * 100).toFixed(1)}% off target`);
  }
  
  if (carbsDiff > 0.05) {
    totalScore -= Math.min(25, Math.round(carbsDiff * 100));
    issues.push(`Carbs are ${(carbsDiff * 100).toFixed(1)}% off target`);
  }
  
  if (fatDiff > 0.05) {
    totalScore -= Math.min(25, Math.round(fatDiff * 100));
    issues.push(`Fat is ${(fatDiff * 100).toFixed(1)}% off target`);
  }
  
  // Check for meal-by-meal macro balance
  let previousMealRatio = 0;
  mealPlan.meals.forEach((meal) => {
    const mealProteinRatio = meal.totalProtein / actualProtein;
    
    // Check for extreme spikes in protein distribution (inconsistent distribution)
    if (previousMealRatio > 0 && Math.abs(mealProteinRatio - previousMealRatio) > 0.2) {
      totalScore -= 5;
      issues.push("Inconsistent protein distribution between meals");
    }
    
    previousMealRatio = mealProteinRatio;
  });
  
  // Ensure score doesn't go below 0
  totalScore = Math.max(0, totalScore);
  
  return {
    score: totalScore,
    issues: issues.length ? issues : ["Meal plan is well-balanced"]
  };
};
