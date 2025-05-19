
import { Meal, MealFood, Food, FoodCategory, CookingState } from '@/types/food';
import { foodDataService } from '../foodDataService';
import { MealDistribution } from './types';
import { getSuitableFoodsForMeal, selectOptimalFood } from './foodSelectionService';
import { calculateOptimalPortion, calculateVegetablePortionSize, calculatePortion } from './portionService';

/**
 * Creates a balanced meal with optimal nutrition distribution and realistic portion sizes
 */
export const createBalancedMeal = (
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
 * Keep the original createSampleMeal as a fallback
 */
export const createSampleMeal = (
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
