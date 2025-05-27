
import { NutritionCartItem } from '@/contexts/NutritionCartContext';
import { TDEEResult } from './types';
import { 
  getFoodsByMealType, 
  calculateNutritionForPortion, 
  findFoodsByNutritionProfile,
  FoodItem 
} from '../foodDatabase';

/**
 * Generate nutrition cart items based on TDEE calculation
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
  
  // Get appropriate foods for this meal type
  const availableFoods = getFoodsByMealType(mealType);
  
  if (availableFoods.length === 0) {
    return items;
  }

  let remainingCalories = targetCalories;
  let remainingProtein = targetProtein;
  let remainingCarbs = targetCarbs;
  let remainingFat = targetFat;

  // Strategy: Add foods based on macro priorities for the goal
  const macroStrategy = getMacroStrategy(goal);
  
  // Add main items based on strategy
  for (const macro of macroStrategy) {
    if (remainingCalories <= 0) break;
    
    const categoryFoods = availableFoods.filter(food => 
      getPrimaryMacroCategory(food) === macro
    );
    
    if (categoryFoods.length === 0) continue;
    
    // Select a food that fits well
    const selectedFood = selectOptimalFood(categoryFoods, remainingCalories, macro);
    if (!selectedFood) continue;
    
    // Calculate portion to meet macro needs
    const portion = calculateOptimalPortion(
      selectedFood, 
      remainingCalories, 
      remainingProtein, 
      remainingCarbs, 
      remainingFat,
      macro
    );
    
    const nutrition = calculateNutritionForPortion(selectedFood, portion);
    
    items.push({
      name: selectedFood.name,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      quantity: 1,
      portion_size: portion,
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

  return items;
}

function getMacroStrategy(goal: string): ('protein' | 'carbs' | 'fat')[] {
  switch (goal.toLowerCase()) {
    case 'lose_weight':
      return ['protein', 'fat', 'carbs']; // Prioritize protein and fat for satiety
    case 'gain_weight':
      return ['carbs', 'protein', 'fat']; // Prioritize carbs for energy
    case 'maintain':
    default:
      return ['protein', 'carbs', 'fat']; // Balanced approach
  }
}

function getPrimaryMacroCategory(food: FoodItem): 'protein' | 'carbs' | 'fat' {
  const { protein, carbs, fat } = food;
  
  // Determine primary macro based on highest percentage
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  
  if (proteinCals >= carbsCals && proteinCals >= fatCals) return 'protein';
  if (fatCals >= carbsCals) return 'fat';
  return 'carbs';
}

function selectOptimalFood(foods: FoodItem[], targetCalories: number, priorityMacro: 'protein' | 'carbs' | 'fat'): FoodItem | null {
  if (foods.length === 0) return null;
  
  // Score foods based on how well they fit the calorie target and macro priority
  const scoredFoods = foods.map(food => {
    const defaultNutrition = calculateNutritionForPortion(food, food.defaultPortion);
    const calorieScore = 1 - Math.abs(defaultNutrition.calories - targetCalories) / targetCalories;
    
    // Bonus for foods high in priority macro
    let macroBonus = 0;
    switch (priorityMacro) {
      case 'protein':
        macroBonus = food.protein / 100; // Higher protein = higher bonus
        break;
      case 'carbs':
        macroBonus = food.carbs / 100;
        break;
      case 'fat':
        macroBonus = food.fat / 100;
        break;
    }
    
    return {
      food,
      score: calorieScore + macroBonus * 0.3 // Weight macro bonus at 30%
    };
  });
  
  // Sort by score and return the best option
  scoredFoods.sort((a, b) => b.score - a.score);
  return scoredFoods[0]?.food || null;
}

function calculateOptimalPortion(
  food: FoodItem, 
  targetCalories: number, 
  targetProtein: number, 
  targetCarbs: number, 
  targetFat: number,
  priorityMacro: 'protein' | 'carbs' | 'fat'
): number {
  // Start with default portion and adjust based on calorie target
  let portion = food.defaultPortion;
  
  // Calculate what portion would give us target calories
  const calorieBasedPortion = (targetCalories * 100) / food.calories;
  
  // Don't go too extreme with portion sizes
  const minPortion = food.defaultPortion * 0.3;
  const maxPortion = food.defaultPortion * 2.5;
  
  portion = Math.max(minPortion, Math.min(maxPortion, calorieBasedPortion));
  
  return Math.round(portion);
}
