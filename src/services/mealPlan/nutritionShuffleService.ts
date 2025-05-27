
import { NutritionCartItem } from '@/contexts/NutritionCartContext';
import { TDEEResult } from '@/components/fitness/TDEECalculator';
import { generateNutritionMealPlan } from './nutritionMealGenerationService';

/**
 * Shuffles nutrition cart items by generating new alternatives
 */
export const shuffleNutritionPlan = (
  currentItems: NutritionCartItem[],
  tdeeResult: TDEEResult
): Omit<NutritionCartItem, 'id'>[] => {
  // Generate a completely new meal plan
  return generateNutritionMealPlan(tdeeResult);
};

/**
 * Shuffles a specific meal type (breakfast, lunch, dinner, snack)
 */
export const shuffleMealType = (
  currentItems: NutritionCartItem[],
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  tdeeResult: TDEEResult
): Omit<NutritionCartItem, 'id'>[] => {
  // Filter items for the specific meal type
  const mealItems = currentItems.filter(item => item.meal_type === mealType);
  
  if (mealItems.length === 0) return [];
  
  // Calculate total nutrition for this meal type
  const totalCalories = mealItems.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
  const totalProtein = mealItems.reduce((sum, item) => sum + (item.protein * item.quantity), 0);
  const totalCarbs = mealItems.reduce((sum, item) => sum + (item.carbs * item.quantity), 0);
  const totalFat = mealItems.reduce((sum, item) => sum + (item.fat * item.quantity), 0);
  
  // Generate new items for this meal type with similar nutrition targets
  return generateMealItems(mealType, totalCalories, totalProtein, totalCarbs, totalFat, tdeeResult.goal);
};

/**
 * Shuffles a single nutrition item with similar nutritional profile
 */
export const shuffleSingleItem = (
  item: NutritionCartItem,
  goal: string
): Omit<NutritionCartItem, 'id'> => {
  const alternatives = getAlternativeItems(item.meal_type, item.food_category || 'protein');
  
  if (alternatives.length === 0) {
    return {
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      quantity: item.quantity,
      portion_size: item.portion_size,
      meal_type: item.meal_type,
      food_category: item.food_category,
      usda_food_id: item.usda_food_id
    };
  }
  
  const randomAlternative = alternatives[Math.floor(Math.random() * alternatives.length)];
  return randomAlternative;
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
  
  // Food alternatives for each meal type
  const foodAlternatives = {
    breakfast: [
      {
        name: 'Scrambled Eggs with Toast',
        calories: Math.round(targetCalories * 0.6),
        protein: Math.round(targetProtein * 0.5),
        carbs: Math.round(targetCarbs * 0.6),
        fat: Math.round(targetFat * 0.4),
        quantity: 1,
        portion_size: 200,
        meal_type: mealType,
        food_category: 'protein',
        usda_food_id: 'scrambled_eggs_toast'
      },
      {
        name: 'Protein Smoothie',
        calories: Math.round(targetCalories * 0.4),
        protein: Math.round(targetProtein * 0.5),
        carbs: Math.round(targetCarbs * 0.4),
        fat: Math.round(targetFat * 0.6),
        quantity: 1,
        portion_size: 300,
        meal_type: mealType,
        food_category: 'dairy',
        usda_food_id: 'protein_smoothie'
      }
    ],
    lunch: [
      {
        name: 'Turkey Sandwich',
        calories: Math.round(targetCalories * 0.5),
        protein: Math.round(targetProtein * 0.6),
        carbs: Math.round(targetCarbs * 0.5),
        fat: Math.round(targetFat * 0.3),
        quantity: 1,
        portion_size: 250,
        meal_type: mealType,
        food_category: 'protein',
        usda_food_id: 'turkey_sandwich'
      },
      {
        name: 'Quinoa Bowl',
        calories: Math.round(targetCalories * 0.3),
        protein: Math.round(targetProtein * 0.3),
        carbs: Math.round(targetCarbs * 0.4),
        fat: Math.round(targetFat * 0.4),
        quantity: 1,
        portion_size: 180,
        meal_type: mealType,
        food_category: 'grains',
        usda_food_id: 'quinoa_bowl'
      },
      {
        name: 'Side Vegetables',
        calories: Math.round(targetCalories * 0.2),
        protein: Math.round(targetProtein * 0.1),
        carbs: Math.round(targetCarbs * 0.1),
        fat: Math.round(targetFat * 0.3),
        quantity: 1,
        portion_size: 120,
        meal_type: mealType,
        food_category: 'vegetables',
        usda_food_id: 'side_vegetables'
      }
    ],
    dinner: [
      {
        name: 'Grilled Fish',
        calories: Math.round(targetCalories * 0.5),
        protein: Math.round(targetProtein * 0.7),
        carbs: Math.round(targetCarbs * 0.1),
        fat: Math.round(targetFat * 0.6),
        quantity: 1,
        portion_size: 150,
        meal_type: mealType,
        food_category: 'protein',
        usda_food_id: 'grilled_fish'
      },
      {
        name: 'Roasted Vegetables',
        calories: Math.round(targetCalories * 0.3),
        protein: Math.round(targetProtein * 0.2),
        carbs: Math.round(targetCarbs * 0.6),
        fat: Math.round(targetFat * 0.2),
        quantity: 1,
        portion_size: 160,
        meal_type: mealType,
        food_category: 'vegetables',
        usda_food_id: 'roasted_vegetables'
      },
      {
        name: 'Wild Rice',
        calories: Math.round(targetCalories * 0.2),
        protein: Math.round(targetProtein * 0.1),
        carbs: Math.round(targetCarbs * 0.3),
        fat: Math.round(targetFat * 0.2),
        quantity: 1,
        portion_size: 90,
        meal_type: mealType,
        food_category: 'grains',
        usda_food_id: 'wild_rice'
      }
    ],
    snack: [
      {
        name: 'Trail Mix',
        calories: Math.round(targetCalories * 0.6),
        protein: Math.round(targetProtein * 0.5),
        carbs: Math.round(targetCarbs * 0.4),
        fat: Math.round(targetFat * 0.7),
        quantity: 1,
        portion_size: 35,
        meal_type: mealType,
        food_category: 'nuts',
        usda_food_id: 'trail_mix'
      },
      {
        name: 'Banana',
        calories: Math.round(targetCalories * 0.4),
        protein: Math.round(targetProtein * 0.5),
        carbs: Math.round(targetCarbs * 0.6),
        fat: Math.round(targetFat * 0.3),
        quantity: 1,
        portion_size: 120,
        meal_type: mealType,
        food_category: 'fruits',
        usda_food_id: 'banana'
      }
    ]
  };
  
  return foodAlternatives[mealType] || [];
}

function getAlternativeItems(
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  category: string
): Omit<NutritionCartItem, 'id'>[] {
  const alternatives: { [key: string]: Omit<NutritionCartItem, 'id'>[] } = {
    protein: [
      {
        name: 'Lean Beef',
        calories: 250,
        protein: 26,
        carbs: 0,
        fat: 15,
        quantity: 1,
        portion_size: 100,
        meal_type: mealType,
        food_category: 'protein',
        usda_food_id: 'lean_beef'
      },
      {
        name: 'Chicken Thigh',
        calories: 280,
        protein: 25,
        carbs: 0,
        fat: 18,
        quantity: 1,
        portion_size: 120,
        meal_type: mealType,
        food_category: 'protein',
        usda_food_id: 'chicken_thigh'
      }
    ],
    grains: [
      {
        name: 'Whole Wheat Pasta',
        calories: 350,
        protein: 12,
        carbs: 70,
        fat: 2,
        quantity: 1,
        portion_size: 100,
        meal_type: mealType,
        food_category: 'grains',
        usda_food_id: 'whole_wheat_pasta'
      },
      {
        name: 'Barley',
        calories: 320,
        protein: 10,
        carbs: 65,
        fat: 2,
        quantity: 1,
        portion_size: 100,
        meal_type: mealType,
        food_category: 'grains',
        usda_food_id: 'barley'
      }
    ]
  };
  
  return alternatives[category] || [];
}
