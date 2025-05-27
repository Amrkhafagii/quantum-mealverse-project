
import { NutritionCartItem } from '@/contexts/NutritionCartContext';
import { TDEEResult } from './types';
import { foodDatabase, getFoodsByMealType, calculateNutritionForPortion, FoodItem } from '../foodDatabase';

/**
 * Generate nutrition cart items based on TDEE calculation using real food data
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
    const mealItems = generateMealItems(
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

  // Select foods based on meal type and nutritional targets
  let remainingCalories = targetCalories;
  let remainingProtein = targetProtein;
  let remainingCarbs = targetCarbs;
  let remainingFat = targetFat;

  // Prioritize food selection based on meal type
  const foodSelectionStrategy = getFoodSelectionStrategy(mealType);
  
  for (const category of foodSelectionStrategy) {
    if (remainingCalories <= 0) break;
    
    const categoryFoods = availableFoods.filter(food => food.category === category);
    if (categoryFoods.length === 0) continue;

    // Select a random food from this category
    const selectedFood = categoryFoods[Math.floor(Math.random() * categoryFoods.length)];
    
    // Calculate portion size to meet targets
    const portionSize = calculateOptimalPortion(
      selectedFood,
      remainingCalories,
      remainingProtein,
      remainingCarbs,
      remainingFat
    );

    if (portionSize > 0) {
      const nutrition = calculateNutritionForPortion(selectedFood, portionSize);
      
      items.push({
        name: selectedFood.name,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        quantity: 1,
        portion_size: portionSize,
        meal_type: mealType,
        food_category: selectedFood.category,
        usda_food_id: selectedFood.id
      });

      // Update remaining targets
      remainingCalories -= nutrition.calories;
      remainingProtein -= nutrition.protein;
      remainingCarbs -= nutrition.carbs;
      remainingFat -= nutrition.fat;
    }
  }

  return items;
}

function getFoodSelectionStrategy(mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): FoodItem['category'][] {
  switch (mealType) {
    case 'breakfast':
      return ['grains', 'dairy', 'fruits', 'protein'];
    case 'lunch':
      return ['protein', 'grains', 'vegetables'];
    case 'dinner':
      return ['protein', 'vegetables', 'grains'];
    case 'snack':
      return ['fruits', 'nuts', 'dairy'];
    default:
      return ['protein', 'grains', 'vegetables'];
  }
}

function calculateOptimalPortion(
  food: FoodItem,
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): number {
  // Start with the common portion size
  let bestPortion = food.common_portion_size;
  let bestScore = Number.MAX_SAFE_INTEGER;

  // Try different portion sizes to find the best fit
  for (let portion = 20; portion <= 300; portion += 10) {
    const nutrition = calculateNutritionForPortion(food, portion);
    
    // Calculate how well this portion meets our targets (lower score is better)
    const calorieScore = Math.abs(nutrition.calories - targetCalories * 0.3); // 30% of target for this food
    const proteinScore = Math.abs(nutrition.protein - targetProtein * 0.3);
    const carbsScore = Math.abs(nutrition.carbs - targetCarbs * 0.3);
    const fatScore = Math.abs(nutrition.fat - targetFat * 0.3);
    
    const totalScore = calorieScore + proteinScore + carbsScore + fatScore;
    
    if (totalScore < bestScore && nutrition.calories <= targetCalories) {
      bestScore = totalScore;
      bestPortion = portion;
    }
  }

  return bestPortion;
}
