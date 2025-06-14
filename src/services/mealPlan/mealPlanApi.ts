
import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlan } from '@/types/fitness';
import { MealPlan } from '@/types/food';
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
      .eq('saved_meal_plans_user_id', userId)
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
    // Create specific type matching exactly what the database expects
    const mealPlanData = {
      user_id: userId,
      name,
      meal_plan: mealPlan as unknown as Json,
      tdee_id: tdeeId || null,
      date_created: new Date().toISOString(),
      is_active: true
    };

    const { data, error } = await supabase
      .from('saved_meal_plans')
      .insert(mealPlanData)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data: data as unknown as SavedMealPlan, error: null };
  } catch (error) {
    console.error('Error saving meal plan:', error);
    return { data: null, error };
  }
};
