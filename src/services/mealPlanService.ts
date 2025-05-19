import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlan } from '@/types/fitness';
import { MealPlan, Meal, Food, MealFood } from '@/types/food';
import { Json } from '@/types/database';
import { foodDataService, FoodItem, NutritionData } from './foodDataService';

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
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .insert({
        user_id: userId,
        name,
        meal_plan: mealPlan as unknown as Json,
        tdee_id: tdeeId || null,
        date_created: new Date().toISOString(),
        expires_at: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return { data: data as unknown as SavedMealPlan, error: null };
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
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .update(updates)
      .eq('id', planId)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data: data as unknown as SavedMealPlan, error: null };
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
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .update({
        expires_at: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      })
      .eq('id', planId)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data: data as unknown as SavedMealPlan, error: null };
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
    const { error } = await supabase
      .from('saved_meal_plans')
      .update({
        expires_at: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      })
      .eq('id', planId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error renewing meal plan:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Shuffle a meal to generate alternatives using accurate nutrition data
 */
export const shuffleMeal = async (
  meal: Meal,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): Promise<Meal> => {
  // Create a deep copy of the meal
  const newMeal = JSON.parse(JSON.stringify(meal)) as Meal;
  
  try {
    // List of possible food categories to search for replacements
    const categories = ['protein', 'carbs', 'fats', 'vegetables'];
    
    // Search for alternative foods for each category
    for (let i = 0; i < newMeal.foods.length; i++) {
      const currentFood = newMeal.foods[i].food;
      const category = currentFood.category as string;
      
      // Skip if we're on the last item to preserve some consistency
      if (i === newMeal.foods.length - 1 && Math.random() > 0.7) continue;
      
      // Get alternative food based on category
      if (categories.includes(category)) {
        let searchTerm;
        switch(category) {
          case 'protein':
            searchTerm = ['chicken', 'turkey', 'salmon', 'tofu', 'beef'][Math.floor(Math.random() * 5)];
            break;
          case 'carbs':
            searchTerm = ['rice', 'potato', 'quinoa', 'pasta', 'oats'][Math.floor(Math.random() * 5)];
            break;
          case 'fats':
            searchTerm = ['avocado', 'olive oil', 'nuts', 'seeds', 'cheese'][Math.floor(Math.random() * 5)];
            break;
          case 'vegetables':
            searchTerm = ['broccoli', 'spinach', 'kale', 'bell pepper', 'carrot'][Math.floor(Math.random() * 5)];
            break;
          default:
            searchTerm = currentFood.name;
        }
        
        // Search for alternative food using USDA API
        const foodResults = await foodDataService.searchFood(searchTerm, 5);
        
        if (foodResults && foodResults.length > 0) {
          // Select a random food from results
          const newFoodData = foodResults[Math.floor(Math.random() * foodResults.length)];
          
          // Extract nutrition data
          const nutrition = foodDataService.extractNutritionData(newFoodData);
          
          // Create new food object with updated data
          const newFood: Food = {
            id: `food-${Date.now()}-${i}`,
            name: newFoodData.description || searchTerm,
            category: currentFood.category,
            calories: nutrition.calories || 0,
            protein: nutrition.protein || 0,
            carbs: nutrition.carbs || 0,
            fat: nutrition.fat || 0,
            portion: currentFood.portion,
            isGloballyAvailable: currentFood.isGloballyAvailable,
            costTier: currentFood.costTier,
            imageUrl: currentFood.imageUrl,
            cookingState: 'raw',  // Default to raw, can be customized later
            mealSuitability: currentFood.mealSuitability
          };
          
          // Adjust portion size to meet target calories
          const targetCalories = currentFood.calories * (newMeal.foods[i].portionSize / currentFood.portion);
          let portionSize = foodDataService.adjustPortionForCalories(
            newFood.calories,
            targetCalories,
            nutrition.servingSize || 100  // Default to 100g if serving size not available
          );
          
          // Update the meal food with the new food and adjusted portion
          newMeal.foods[i] = {
            food: newFood,
            portionSize: portionSize
          };
        }
      }
    }
    
    // Recalculate meal totals based on new foods
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    newMeal.foods.forEach(mealFood => {
      const { food, portionSize } = mealFood;
      const ratio = portionSize / food.portion;
      
      totalCalories += food.calories * ratio;
      totalProtein += food.protein * ratio;
      totalCarbs += food.carbs * ratio;
      totalFat += food.fat * ratio;
    });
    
    // Now fine-tune to meet macronutrient targets by adjusting portions of all foods
    // First check if we need to adjust
    const proteinDiff = targetProtein - totalProtein;
    const carbsDiff = targetCarbs - totalCarbs;
    const fatDiff = targetFat - totalFat;
    
    if (Math.abs(proteinDiff) > 2 || Math.abs(carbsDiff) > 5 || Math.abs(fatDiff) > 2) {
      // Find the food with the highest protein content for protein adjustment
      const proteinFood = [...newMeal.foods].sort((a, b) => b.food.protein / b.food.portion - a.food.protein / a.food.portion)[0];
      
      // Find the food with the highest carbs content for carb adjustment
      const carbsFood = [...newMeal.foods].sort((a, b) => b.food.carbs / b.food.portion - a.food.carbs / a.food.portion)[0];
      
      // Find the food with the highest fat content for fat adjustment
      const fatFood = [...newMeal.foods].sort((a, b) => b.food.fat / b.food.portion - a.food.fat / a.food.portion)[0];
      
      // Make adjustments to portions 
      if (proteinDiff !== 0 && proteinFood) {
        const proteinPerGram = proteinFood.food.protein / proteinFood.food.portion;
        const gramsToAdd = proteinDiff / proteinPerGram;
        proteinFood.portionSize = Math.max(10, proteinFood.portionSize + gramsToAdd);
      }
      
      if (carbsDiff !== 0 && carbsFood) {
        const carbsPerGram = carbsFood.food.carbs / carbsFood.food.portion;
        const gramsToAdd = carbsDiff / carbsPerGram;
        carbsFood.portionSize = Math.max(10, carbsFood.portionSize + gramsToAdd);
      }
      
      if (fatDiff !== 0 && fatFood) {
        const fatPerGram = fatFood.food.fat / fatFood.food.portion;
        const gramsToAdd = fatDiff / fatPerGram;
        fatFood.portionSize = Math.max(5, fatFood.portionSize + gramsToAdd);
      }
      
      // Recalculate one last time
      totalCalories = 0;
      totalProtein = 0;
      totalCarbs = 0;
      totalFat = 0;
      
      newMeal.foods.forEach(mealFood => {
        const { food, portionSize } = mealFood;
        const ratio = portionSize / food.portion;
        
        totalCalories += food.calories * ratio;
        totalProtein += food.protein * ratio;
        totalCarbs += food.carbs * ratio;
        totalFat += food.fat * ratio;
      });
    }
    
    // Set final values
    newMeal.totalCalories = Math.round(totalCalories);
    newMeal.totalProtein = Math.round(totalProtein);
    newMeal.totalCarbs = Math.round(totalCarbs);
    newMeal.totalFat = Math.round(totalFat);
    
    return newMeal;
  } catch (error) {
    console.error('Error shuffling meal with nutrition data:', error);
    
    // Fallback to the existing implementation if there's an error
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
  }
};

/**
 * Generate a meal plan based on TDEE calculation using accurate nutrition data
 */
export const generateMealPlan = async (tdeeResult: any): Promise<MealPlan> => {
  const { adjustedCalories, proteinGrams, carbsGrams, fatsGrams, goal, weight, activityLevel } = tdeeResult;
  
  // Distribution of calories across meals
  const breakfastRatio = 0.25;
  const lunchRatio = 0.35;
  const snackRatio = 0.15;
  const dinnerRatio = 0.25;
  
  // Generate meals with accurate nutrition data
  const breakfast = await createAccurateMeal(
    'Breakfast',
    Math.round(adjustedCalories * breakfastRatio),
    Math.round(proteinGrams * breakfastRatio),
    Math.round(carbsGrams * breakfastRatio),
    Math.round(fatsGrams * breakfastRatio)
  );
  
  const lunch = await createAccurateMeal(
    'Lunch',
    Math.round(adjustedCalories * lunchRatio),
    Math.round(proteinGrams * lunchRatio),
    Math.round(carbsGrams * lunchRatio),
    Math.round(fatsGrams * lunchRatio)
  );
  
  const snack = await createAccurateMeal(
    'Snack',
    Math.round(adjustedCalories * snackRatio),
    Math.round(proteinGrams * snackRatio),
    Math.round(carbsGrams * snackRatio),
    Math.round(fatsGrams * snackRatio)
  );
  
  const dinner = await createAccurateMeal(
    'Dinner',
    Math.round(adjustedCalories * dinnerRatio),
    Math.round(proteinGrams * dinnerRatio),
    Math.round(carbsGrams * dinnerRatio),
    Math.round(fatsGrams * dinnerRatio)
  );
  
  // Calculate recommended water intake based on weight and activity
  const hydrationTarget = foodDataService.calculateWaterIntake(
    Number(weight) || 70,  // Default to 70kg if weight not provided
    activityLevel || 'moderately-active'  // Default to moderate if not provided
  );

  // Sum up actual macros from all meals
  const actualProtein = breakfast.totalProtein + lunch.totalProtein + snack.totalProtein + dinner.totalProtein;
  const actualCarbs = breakfast.totalCarbs + lunch.totalCarbs + snack.totalCarbs + dinner.totalCarbs;
  const actualFat = breakfast.totalFat + lunch.totalFat + snack.totalFat + dinner.totalFat;
  const totalCalories = breakfast.totalCalories + lunch.totalCalories + snack.totalCalories + dinner.totalCalories;

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
    meals: [breakfast, lunch, snack, dinner],
    hydrationTarget
  };
};

/**
 * Creates a meal with accurate nutrition data from USDA database
 */
const createAccurateMeal = async (
  name: string, 
  calories: number, 
  protein: number, 
  carbs: number, 
  fat: number
): Promise<Meal> => {
  // Food search terms based on meal type
  let proteinFoodTerms: string[] = [];
  let carbFoodTerms: string[] = [];
  let fatFoodTerms: string[] = [];
  let veggieFoodTerms: string[] = [];
  
  // Select appropriate foods based on meal type for better meal composition
  switch(name.toLowerCase()) {
    case 'breakfast':
      proteinFoodTerms = ['eggs', 'greek yogurt', 'cottage cheese', 'turkey bacon'];
      carbFoodTerms = ['oatmeal', 'whole grain bread', 'banana', 'whole grain cereal'];
      fatFoodTerms = ['avocado', 'peanut butter', 'almond butter', 'chia seeds'];
      veggieFoodTerms = ['spinach', 'tomato', 'bell pepper', 'mushrooms'];
      break;
    case 'lunch':
      proteinFoodTerms = ['chicken breast', 'tuna', 'turkey', 'tofu'];
      carbFoodTerms = ['brown rice', 'quinoa', 'whole grain bread', 'sweet potato'];
      fatFoodTerms = ['olive oil', 'avocado', 'nuts', 'seeds'];
      veggieFoodTerms = ['mixed greens', 'broccoli', 'carrots', 'cucumber'];
      break;
    case 'snack':
      proteinFoodTerms = ['protein powder', 'greek yogurt', 'hard boiled eggs', 'cottage cheese'];
      carbFoodTerms = ['apple', 'banana', 'berries', 'whole grain crackers'];
      fatFoodTerms = ['almonds', 'walnuts', 'peanut butter', 'hummus'];
      veggieFoodTerms = ['carrots', 'celery', 'bell peppers', 'cucumber'];
      break;
    case 'dinner':
      proteinFoodTerms = ['salmon', 'chicken breast', 'lean beef', 'lentils'];
      carbFoodTerms = ['brown rice', 'quinoa', 'sweet potato', 'whole grain pasta'];
      fatFoodTerms = ['olive oil', 'avocado', 'nuts', 'seeds'];
      veggieFoodTerms = ['broccoli', 'asparagus', 'green beans', 'Brussels sprouts'];
      break;
    default:
      proteinFoodTerms = ['chicken breast', 'eggs', 'greek yogurt', 'tuna'];
      carbFoodTerms = ['brown rice', 'oatmeal', 'sweet potato', 'whole grain bread'];
      fatFoodTerms = ['avocado', 'olive oil', 'nuts', 'seeds'];
      veggieFoodTerms = ['broccoli', 'spinach', 'mixed greens', 'bell peppers'];
  }
  
  // Random selection from food categories based on meal type
  const proteinFoodTerm = proteinFoodTerms[Math.floor(Math.random() * proteinFoodTerms.length)];
  const carbFoodTerm = carbFoodTerms[Math.floor(Math.random() * carbFoodTerms.length)];
  const fatFoodTerm = fatFoodTerms[Math.floor(Math.random() * fatFoodTerms.length)];
  const veggieFoodTerm = veggieFoodTerms[Math.floor(Math.random() * veggieFoodTerms.length)];
  
  try {
    // Fetch nutrition data from USDA API for each food category
    const [proteinResults, carbResults, fatResults, veggieResults] = await Promise.all([
      foodDataService.searchFood(proteinFoodTerm, 3),
      foodDataService.searchFood(carbFoodTerm, 3),
      foodDataService.searchFood(fatFoodTerm, 3),
      foodDataService.searchFood(veggieFoodTerm, 3)
    ]);
    
    // Select the first result or fallback if not found
    const proteinFoodData = proteinResults[0] || createFallbackFood('protein', proteinFoodTerm);
    const carbFoodData = carbResults[0] || createFallbackFood('carbs', carbFoodTerm);
    const fatFoodData = fatResults[0] || createFallbackFood('fats', fatFoodTerm);
    const veggieFoodData = veggieResults[0] || createFallbackFood('vegetable', veggieFoodTerm);
    
    // Extract nutrition data
    const proteinNutrition = foodDataService.extractNutritionData(proteinFoodData);
    const carbNutrition = foodDataService.extractNutritionData(carbFoodData);
    const fatNutrition = foodDataService.extractNutritionData(fatFoodData);
    const veggieNutrition = foodDataService.extractNutritionData(veggieFoodData);
    
    // Create food objects
    const proteinFood: Food = {
      id: `food-${Date.now()}-1`,
      name: proteinFoodData.description || proteinFoodTerm,
      category: 'protein',
      calories: proteinNutrition.calories,
      protein: proteinNutrition.protein,
      carbs: proteinNutrition.carbs,
      fat: proteinNutrition.fat,
      portion: 100, // Standard portion in grams
      isGloballyAvailable: true,
      costTier: 2,
      cookingState: 'raw'
    };
    
    const carbFood: Food = {
      id: `food-${Date.now()}-2`,
      name: carbFoodData.description || carbFoodTerm,
      category: 'carbs',
      calories: carbNutrition.calories,
      protein: carbNutrition.protein,
      carbs: carbNutrition.carbs,
      fat: carbNutrition.fat,
      portion: 100, // Standard portion in grams
      isGloballyAvailable: true,
      costTier: 1,
      cookingState: 'raw'
    };
    
    const fatFood: Food = {
      id: `food-${Date.now()}-3`,
      name: fatFoodData.description || fatFoodTerm,
      category: 'fats',
      calories: fatNutrition.calories,
      protein: fatNutrition.protein,
      carbs: fatNutrition.carbs,
      fat: fatNutrition.fat,
      portion: 100, // Standard portion in grams
      isGloballyAvailable: true,
      costTier: 2,
      cookingState: 'raw'
    };
    
    const veggieFood: Food = {
      id: `food-${Date.now()}-4`,
      name: veggieFoodData.description || veggieFoodTerm,
      category: 'vegetables',
      calories: veggieNutrition.calories,
      protein: veggieNutrition.protein,
      carbs: veggieNutrition.carbs,
      fat: veggieNutrition.fat,
      portion: 100, // Standard portion in grams
      isGloballyAvailable: true,
      costTier: 1,
      cookingState: 'raw'
    };
    
    // Calculate portion sizes to match macronutrient targets
    // We'll distribute the targets with an emphasis on:
    // - Protein mainly from protein foods
    // - Carbs mainly from carb foods
    // - Fat from fat foods and some from protein
    
    // Target distribution for each category (simplified)
    const proteinDistribution = { protein: 0.7, carbs: 0.1, fat: 0.2 };
    const carbDistribution = { protein: 0.1, carbs: 0.8, fat: 0.1 };
    const fatDistribution = { protein: 0.1, carbs: 0.1, fat: 0.6 };
    const veggieDistribution = { protein: 0.1, carbs: 0, fat: 0.1 };
    
    // Calculate base portion sizes
    let proteinPortion = calculatePortion(proteinFood, proteinDistribution.protein * protein, 'protein');
    let carbPortion = calculatePortion(carbFood, carbDistribution.carbs * carbs, 'carbs');
    let fatPortion = calculatePortion(fatFood, fatDistribution.fat * fat, 'fat');
    const veggiePortion = 100; // Fixed portion for vegetables
    
    // Create meal foods
    const mealFoods: MealFood[] = [
      { food: proteinFood, portionSize: proteinPortion },
      { food: carbFood, portionSize: carbPortion },
      { food: fatFood, portionSize: fatPortion },
      { food: veggieFood, portionSize: veggiePortion }
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
    
    // Adjust portions if needed to get closer to targets
    // This is a simplified approach; a real implementation would use optimization
    if (Math.abs(totalProtein - protein) > 3 || 
        Math.abs(totalCarbs - carbs) > 5 || 
        Math.abs(totalFat - fat) > 3) {
      
      const proteinRatio = protein / (totalProtein || 1);
      const carbsRatio = carbs / (totalCarbs || 1);
      const fatRatio = fat / (totalFat || 1);
      
      // Adjust protein food
      mealFoods[0].portionSize = Math.max(30, Math.round(mealFoods[0].portionSize * proteinRatio));
      
      // Adjust carb food
      mealFoods[1].portionSize = Math.max(30, Math.round(mealFoods[1].portionSize * carbsRatio));
      
      // Adjust fat food
      mealFoods[2].portionSize = Math.max(10, Math.round(mealFoods[2].portionSize * fatRatio));
      
      // Recalculate totals
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
    console.error('Error creating accurate meal:', error);
    
    // Fall back to the original meal creation method if there's an error
    return createSampleMeal(name, calories, protein, carbs, fat);
  }
};

/**
 * Calculate portion size needed to hit a specific nutrient target
 */
const calculatePortion = (food: Food, targetGrams: number, nutrientType: 'protein' | 'carbs' | 'fat'): number => {
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
 * Create a fallback food item if API fails
 */
const createFallbackFood = (category: string, name: string): FoodItem => {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  
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
    case 'vegetable':
      calories = 35;
      protein = 2;
      carbs = 7;
      fat = 0;
      break;
  }
  
  // Create the fallback food item with USDA API structure
  return {
    fdcId: Math.floor(Math.random() * 10000) + 50000,
    description: name,
    dataType: 'Foundation',
    publishedDate: new Date().toISOString(),
    foodNutrients: [
      { nutrientId: 1008, nutrientName: 'Energy', nutrientNumber: '208', value: calories, unitName: 'kcal' },
      { nutrientId: 1003, nutrientName: 'Protein', nutrientNumber: '203', value: protein, unitName: 'g' },
      { nutrientId: 1005, nutrientName: 'Carbohydrates', nutrientNumber: '205', value: carbs, unitName: 'g' },
      { nutrientId: 1004, nutrientName: 'Fat', nutrientNumber: '204', value: fat, unitName: 'g' }
    ]
  };
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
