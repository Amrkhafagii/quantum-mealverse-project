
import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlan } from '@/types/fitness';
import { MealPlan, Meal, Food, MealFood } from '@/types/food';
import { Json } from '@/types/database';

/**
 * Fetches all saved meal plans for a user
 */
export const getUserSavedMealPlans = async (userId: string): Promise<{
  data: SavedMealPlan[] | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('date_created', { ascending: false });
      
    if (error) throw error;
    
    return { data: data as unknown as SavedMealPlan[], error: null };
  } catch (error) {
    console.error('Error fetching saved meal plans:', error);
    return { data: null, error };
  }
};

/**
 * Gets a single meal plan by ID
 */
export const getMealPlanById = async (planId: string): Promise<{
  data: SavedMealPlan | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .select('*')
      .eq('id', planId)
      .single();
      
    if (error) throw error;
    
    return { data: data as unknown as SavedMealPlan, error: null };
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    return { data: null, error };
  }
};

/**
 * Saves a meal plan for a user
 */
export const saveMealPlan = async (
  userId: string,
  name: string,
  mealPlan: MealPlan,
  tdeeId?: string
): Promise<{
  data: SavedMealPlan | null;
  error: any;
}> => {
  try {
    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newPlan = {
      id: crypto.randomUUID(),
      user_id: userId,
      name,
      meal_plan: mealPlan as unknown as Json,
      tdee_id: tdeeId || null,
      date_created: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_active: true
    };
    
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .insert([newPlan])
      .select();
      
    if (error) throw error;
    
    return { data: data[0] as unknown as SavedMealPlan, error: null };
  } catch (error) {
    console.error('Error saving meal plan:', error);
    return { data: null, error };
  }
};

/**
 * Deletes a saved meal plan
 */
export const deleteSavedMealPlan = async (planId: string, userId: string): Promise<{
  success: boolean;
  error: any;
}> => {
  try {
    const { error } = await supabase
      .from('saved_meal_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return { success: false, error };
  }
};

/**
 * Updates a saved meal plan
 */
export const updateSavedMealPlan = async (
  planId: string,
  userId: string,
  updates: Partial<SavedMealPlan>
): Promise<{
  data: SavedMealPlan | null;
  error: any;
}> => {
  try {
    // Convert meal_plan to Json if it exists in updates
    const updatesWithJsonConversion = {
      ...updates,
      meal_plan: updates.meal_plan ? (updates.meal_plan as unknown as Json) : undefined,
    };
    
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .update(updatesWithJsonConversion as any)
      .eq('id', planId)
      .eq('user_id', userId)
      .select();
      
    if (error) throw error;
    
    return { data: data[0] as unknown as SavedMealPlan, error: null };
  } catch (error) {
    console.error('Error updating meal plan:', error);
    return { data: null, error };
  }
};

/**
 * Extends the expiration of a meal plan by 30 days
 */
export const extendMealPlanExpiration = async (
  planId: string,
  userId: string
): Promise<{
  data: SavedMealPlan | null;
  error: any;
}> => {
  try {
    // Calculate new expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .update({
        expires_at: expiresAt.toISOString(),
        is_active: true
      } as any)
      .eq('id', planId)
      .eq('user_id', userId)
      .select();
      
    if (error) throw error;
    
    return { data: data[0] as unknown as SavedMealPlan, error: null };
  } catch (error) {
    console.error('Error extending meal plan expiration:', error);
    return { data: null, error };
  }
};

/**
 * Calculate days remaining until expiration
 */
export const getDaysRemaining = (expiresAt: string): number => {
  const now = new Date();
  const expiryDate = new Date(expiresAt);
  const diffTime = expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Renew a meal plan for 14 more days
 */
export const renewMealPlan = async (planId: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // Calculate new expiry date (14 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    
    const { error } = await supabase
      .from('saved_meal_plans')
      .update({
        expires_at: expiresAt.toISOString(),
        is_active: true
      } as any)
      .eq('id', planId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error renewing meal plan:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Shuffle a meal to generate alternatives
 */
export const shuffleMeal = (
  meal: Meal,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): Meal => {
  // This is a simplified implementation, in a real app this would connect to a food database
  // and generate a genuinely different meal with similar macro nutrients
  
  // Create a deep copy of the meal
  const newMeal = JSON.parse(JSON.stringify(meal)) as Meal;
  
  // Adjust the meal slightly to simulate shuffling
  const variationFactor = 0.9 + Math.random() * 0.2; // Random factor between 0.9 and 1.1
  
  // Adjust total nutrients
  newMeal.totalProtein = Math.round(targetProtein * variationFactor);
  newMeal.totalCarbs = Math.round(targetCarbs * variationFactor);
  newMeal.totalFat = Math.round(targetFat * variationFactor);
  newMeal.totalCalories = Math.round(
    (newMeal.totalProtein * 4) + (newMeal.totalCarbs * 4) + (newMeal.totalFat * 9)
  );
  
  // Create new food items (in a real app, these would be different foods)
  if (newMeal.foods && newMeal.foods.length > 0) {
    newMeal.foods = newMeal.foods.map(food => {
      const newFood = { ...food };
      newFood.portionSize = Math.round(food.portionSize * variationFactor);
      return newFood;
    });
  }
  
  return newMeal;
};

/**
 * Generate a meal plan based on TDEE calculation
 */
export const generateMealPlan = (tdeeResult: any): MealPlan => {
  const { adjustedCalories, proteinGrams, carbsGrams, fatsGrams, goal } = tdeeResult;
  
  // Distribution of calories across meals
  const breakfastRatio = 0.25;
  const lunchRatio = 0.35;
  const snackRatio = 0.15;
  const dinnerRatio = 0.25;
  
  // Generate meals
  const breakfast = createSampleMeal(
    'Breakfast',
    Math.round(adjustedCalories * breakfastRatio),
    Math.round(proteinGrams * breakfastRatio),
    Math.round(carbsGrams * breakfastRatio),
    Math.round(fatsGrams * breakfastRatio)
  );
  
  const lunch = createSampleMeal(
    'Lunch',
    Math.round(adjustedCalories * lunchRatio),
    Math.round(proteinGrams * lunchRatio),
    Math.round(carbsGrams * lunchRatio),
    Math.round(fatsGrams * lunchRatio)
  );
  
  const snack = createSampleMeal(
    'Snack',
    Math.round(adjustedCalories * snackRatio),
    Math.round(proteinGrams * snackRatio),
    Math.round(carbsGrams * snackRatio),
    Math.round(fatsGrams * snackRatio)
  );
  
  const dinner = createSampleMeal(
    'Dinner',
    Math.round(adjustedCalories * dinnerRatio),
    Math.round(proteinGrams * dinnerRatio),
    Math.round(carbsGrams * dinnerRatio),
    Math.round(fatsGrams * dinnerRatio)
  );

  return {
    id: crypto.randomUUID(),
    goal,
    totalCalories: adjustedCalories,
    targetProtein: proteinGrams,
    targetCarbs: carbsGrams,
    targetFat: fatsGrams,
    actualProtein: proteinGrams,
    actualCarbs: carbsGrams,
    actualFat: fatsGrams,
    meals: [breakfast, lunch, snack, dinner],
    hydrationTarget: Math.round(adjustedCalories * 0.03) // 30ml per 1000 calories
  };
};

// Helper function to create a sample meal
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

  // Calculate portion sizes to roughly match macros
  const proteinPortion = Math.max(100, Math.round((protein / proteinFood.protein) * 100));
  const carbPortion = Math.max(100, Math.round((carbs / carbFood.carbs) * 100));
  const fatPortion = Math.max(15, Math.round((fat / fatFood.fat) * 15));
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
