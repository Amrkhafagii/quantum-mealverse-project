
import { NutritionCartItem } from '@/contexts/NutritionCartContext';
import { foodDataService } from '../foodDataService';
import { TDEEResult } from './types';

/**
 * Generate nutrition cart items based on TDEE calculation
 */
export const generateNutritionMealPlan = (tdeeResult: TDEEResult): NutritionCartItem[] => {
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
  
  switch (mealType) {
    case 'breakfast':
      items.push(
        {
          name: 'Oatmeal with Berries',
          calories: Math.round(targetCalories * 0.6),
          protein: Math.round(targetProtein * 0.4),
          carbs: Math.round(targetCarbs * 0.7),
          fat: Math.round(targetFat * 0.3),
          quantity: 1,
          portion_size: 150,
          meal_type: mealType,
          food_category: 'grains',
          usda_food_id: 'oatmeal_berries'
        },
        {
          name: 'Greek Yogurt',
          calories: Math.round(targetCalories * 0.4),
          protein: Math.round(targetProtein * 0.6),
          carbs: Math.round(targetCarbs * 0.3),
          fat: Math.round(targetFat * 0.7),
          quantity: 1,
          portion_size: 170,
          meal_type: mealType,
          food_category: 'dairy',
          usda_food_id: 'greek_yogurt'
        }
      );
      break;

    case 'lunch':
      items.push(
        {
          name: 'Grilled Chicken Breast',
          calories: Math.round(targetCalories * 0.5),
          protein: Math.round(targetProtein * 0.7),
          carbs: Math.round(targetCarbs * 0.1),
          fat: Math.round(targetFat * 0.4),
          quantity: 1,
          portion_size: 120,
          meal_type: mealType,
          food_category: 'protein',
          usda_food_id: 'chicken_breast'
        },
        {
          name: 'Brown Rice',
          calories: Math.round(targetCalories * 0.3),
          protein: Math.round(targetProtein * 0.2),
          carbs: Math.round(targetCarbs * 0.6),
          fat: Math.round(targetFat * 0.2),
          quantity: 1,
          portion_size: 100,
          meal_type: mealType,
          food_category: 'grains',
          usda_food_id: 'brown_rice'
        },
        {
          name: 'Mixed Vegetables',
          calories: Math.round(targetCalories * 0.2),
          protein: Math.round(targetProtein * 0.1),
          carbs: Math.round(targetCarbs * 0.3),
          fat: Math.round(targetFat * 0.4),
          quantity: 1,
          portion_size: 150,
          meal_type: mealType,
          food_category: 'vegetables',
          usda_food_id: 'mixed_vegetables'
        }
      );
      break;

    case 'dinner':
      items.push(
        {
          name: 'Salmon Fillet',
          calories: Math.round(targetCalories * 0.6),
          protein: Math.round(targetProtein * 0.8),
          carbs: Math.round(targetCarbs * 0.1),
          fat: Math.round(targetFat * 0.7),
          quantity: 1,
          portion_size: 140,
          meal_type: mealType,
          food_category: 'protein',
          usda_food_id: 'salmon_fillet'
        },
        {
          name: 'Sweet Potato',
          calories: Math.round(targetCalories * 0.25),
          protein: Math.round(targetProtein * 0.1),
          carbs: Math.round(targetCarbs * 0.6),
          fat: Math.round(targetFat * 0.1),
          quantity: 1,
          portion_size: 120,
          meal_type: mealType,
          food_category: 'vegetables',
          usda_food_id: 'sweet_potato'
        },
        {
          name: 'Green Salad',
          calories: Math.round(targetCalories * 0.15),
          protein: Math.round(targetProtein * 0.1),
          carbs: Math.round(targetCarbs * 0.3),
          fat: Math.round(targetFat * 0.2),
          quantity: 1,
          portion_size: 100,
          meal_type: mealType,
          food_category: 'vegetables',
          usda_food_id: 'green_salad'
        }
      );
      break;

    case 'snack':
      items.push(
        {
          name: 'Almonds',
          calories: Math.round(targetCalories * 0.7),
          protein: Math.round(targetProtein * 0.6),
          carbs: Math.round(targetCarbs * 0.4),
          fat: Math.round(targetFat * 0.8),
          quantity: 1,
          portion_size: 28,
          meal_type: mealType,
          food_category: 'nuts',
          usda_food_id: 'almonds'
        },
        {
          name: 'Apple',
          calories: Math.round(targetCalories * 0.3),
          protein: Math.round(targetProtein * 0.4),
          carbs: Math.round(targetCarbs * 0.6),
          fat: Math.round(targetFat * 0.2),
          quantity: 1,
          portion_size: 150,
          meal_type: mealType,
          food_category: 'fruits',
          usda_food_id: 'apple'
        }
      );
      break;
  }

  return items;
}
