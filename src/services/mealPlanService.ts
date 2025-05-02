
import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlan } from '@/types/fitness';
import { MealPlan, Meal, Food, MealFood } from '@/types/food';
import { Json } from '@/types/database';
import { v4 as uuidv4 } from 'uuid';

/**
 * Function to save a meal plan with expiration date
 */
export const saveMealPlan = async (mealPlan: MealPlan, name: string, userId: string, tdeeId: string): Promise<{
  success: boolean;
  mealPlanId?: string;
  error?: string;
}> => {
  try {
    // Calculate expiration date (14 days from now)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    // Convert MealPlan to Json type for Supabase
    const mealPlanJson = JSON.parse(JSON.stringify(mealPlan)) as Json;
    
    const { data, error } = await supabase.from('saved_meal_plans').insert({
      id: uuidv4(),
      user_id: userId,
      name,
      date_created: now.toISOString(),
      tdee_id: tdeeId,
      meal_plan: mealPlanJson,
      expires_at: expiresAt.toISOString(),
      is_active: true
    });

    if (error) throw error;

    return {
      success: true,
      mealPlanId: data?.[0]?.id
    };
  } catch (error: any) {
    console.error('Error saving meal plan:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Function to check how many days are remaining until a meal plan expires
 */
export const getDaysRemaining = (expirationDate: string | null | undefined): number => {
  if (!expirationDate) return 0;
  
  try {
    const expiry = new Date(expirationDate);
    const now = new Date();
    
    const differenceInTime = expiry.getTime() - now.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    return Math.max(0, differenceInDays);
  } catch (error) {
    console.error('Error calculating days remaining:', error);
    return 0;
  }
};

/**
 * Function to renew a meal plan for another 14 days
 */
export const renewMealPlan = async (mealPlanId: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // Calculate new expiration date (14 days from now)
    const newExpirationDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    
    const { error } = await supabase
      .from('saved_meal_plans')
      .update({
        expires_at: newExpirationDate.toISOString(),
        is_active: true
      })
      .eq('id', mealPlanId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error renewing meal plan:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Shuffles a meal to generate new options while maintaining nutritional targets
 */
export const shuffleMeal = (
  meal: Meal,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): Meal => {
  // This is a simplified implementation - in a real app, you would likely
  // have a more sophisticated algorithm that pulls from a food database
  
  // Create a copy of the meal to avoid mutating the original
  const newMeal = { ...meal };
  
  // Adjust the total macros slightly to simulate a different meal combination
  const randomFactor = Math.random() * 0.2 + 0.9; // Random between 0.9 and 1.1
  
  newMeal.totalProtein = Math.round(targetProtein * randomFactor);
  newMeal.totalCarbs = Math.round(targetCarbs * randomFactor);
  newMeal.totalFat = Math.round(targetFat * randomFactor);
  
  // Calculate new calories based on macros
  newMeal.totalCalories = Math.round(
    newMeal.totalProtein * 4 + 
    newMeal.totalCarbs * 4 + 
    newMeal.totalFat * 9
  );
  
  // Simulate changes to the meal's food items
  // In a real app, you would replace food items with alternatives from a database
  const simulatedFoods: MealFood[] = meal.foods.map(mealFood => ({
    food: {
      ...mealFood.food,
      calories: Math.round(mealFood.food.calories * randomFactor)
    },
    portionSize: Math.round(mealFood.portionSize * randomFactor)
  }));
  
  newMeal.foods = simulatedFoods;
  
  return newMeal;
};

/**
 * Generates a meal plan based on TDEE results
 */
export const generateMealPlan = (tdeeResult: any): MealPlan => {
  // This is a simplified implementation that would typically use a more 
  // sophisticated algorithm and food database
  
  const { tdee, goal, protein, carbs, fat } = tdeeResult;
  
  const targetCalories = Math.round(tdee);
  const targetProtein = Math.round(protein);
  const targetCarbs = Math.round(carbs);
  const targetFat = Math.round(fat);
  
  // Generate a simplified meal plan structure
  const mealPlan: MealPlan = {
    id: uuidv4(),
    goal: goal || 'maintenance',
    totalCalories: targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    actualProtein: targetProtein,
    actualCarbs: targetCarbs,
    actualFat: targetFat,
    meals: generateSampleMeals(targetCalories, targetProtein, targetCarbs, targetFat),
    hydrationTarget: Math.round(35 * (tdeeResult.weight || 70)) // 35ml per kg of body weight
  };
  
  return mealPlan;
};

/**
 * Helper function to generate sample meal data
 * In a real app, this would pull from a food database
 */
const generateSampleMeals = (calories: number, protein: number, carbs: number, fat: number): Meal[] => {
  // Distribution of calories across meals
  const breakfastRatio = 0.25;
  const lunchRatio = 0.3;
  const snackRatio = 0.15;
  const dinnerRatio = 0.3;
  
  // Generate mock meals
  return [
    createSampleMeal('Breakfast', calories * breakfastRatio, protein * breakfastRatio, carbs * breakfastRatio, fat * breakfastRatio),
    createSampleMeal('Lunch', calories * lunchRatio, protein * lunchRatio, carbs * lunchRatio, fat * lunchRatio),
    createSampleMeal('Snack', calories * snackRatio, protein * snackRatio, carbs * snackRatio, fat * snackRatio),
    createSampleMeal('Dinner', calories * dinnerRatio, protein * dinnerRatio, carbs * dinnerRatio, fat * dinnerRatio)
  ];
};

/**
 * Creates a sample meal with mock food items
 */
const createSampleMeal = (name: string, calories: number, protein: number, carbs: number, fat: number): Meal => {
  // Create mock food items that add up to the target macros
  const sampleFoods: MealFood[] = [
    {
      food: createSampleFood('Protein Source', protein * 0.7, protein, carbs * 0.1, fat * 0.3),
      portionSize: 100
    },
    {
      food: createSampleFood('Carb Source', calories * 0.4, protein * 0.2, carbs * 0.8, fat * 0.1),
      portionSize: 150
    },
    {
      food: createSampleFood('Fat Source', calories * 0.2, protein * 0.1, carbs * 0.1, fat * 0.6),
      portionSize: 50
    },
    {
      food: createSampleFood('Vegetable', calories * 0.1, 0, carbs * 0.1, 0),
      portionSize: 100
    }
  ];
  
  return {
    id: uuidv4(),
    name,
    foods: sampleFoods,
    totalCalories: Math.round(calories),
    totalProtein: Math.round(protein),
    totalCarbs: Math.round(carbs),
    totalFat: Math.round(fat)
  };
};

/**
 * Creates a sample food item with specified macros
 */
const createSampleFood = (name: string, calories: number, protein: number, carbs: number, fat: number): Food => {
  return {
    id: uuidv4(),
    name,
    category: 'protein',
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    portion: 100,
    isGloballyAvailable: true,
    costTier: 1,
    cookingState: 'cooked'
  };
};
