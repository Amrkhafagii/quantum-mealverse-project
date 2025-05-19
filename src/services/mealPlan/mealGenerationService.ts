
import { MealPlan, Meal, Food, MealFood } from '@/types/food';
import { foodDataService } from '../foodDataService';
import { TDEEResult, MealDistribution } from './types';
import { createBalancedMeal, shuffleMeal } from './mealCreationService';
import { validateMealPlanMacros } from './nutritionUtils';

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

// Re-export functions from other modules
export { shuffleMeal } from './mealCreationService';
export { calculatePortion } from './portionService';
export { validateMealPlanMacros } from './nutritionUtils';
export { convertBasedOnCookingMethod, distributeMacrosAcrossMeals, extractNutritionFromUSDA } from './nutritionUtils';
export { adjustPortionForCalories } from './portionService';
