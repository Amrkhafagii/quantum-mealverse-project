
import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlan } from '@/types/fitness';
import { MealPlan } from '@/types/food';

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
      .order('date_created', { ascending: false })
      .returns<SavedMealPlan[]>();
      
    if (error) throw error;
    
    return { data, error: null };
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
      .single()
      .returns<SavedMealPlan>();
      
    if (error) throw error;
    
    return { data, error: null };
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
      meal_plan: mealPlan,
      tdee_id: tdeeId || null,
      date_created: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_active: true
    };
    
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .insert([newPlan])
      .select()
      .returns<SavedMealPlan[]>();
      
    if (error) throw error;
    
    return { data: data[0], error: null };
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
      .returns<SavedMealPlan[]>();
      
    if (error) throw error;
    
    return { data: data[0], error: null };
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
      })
      .eq('id', planId)
      .eq('user_id', userId)
      .select()
      .returns<SavedMealPlan[]>();
      
    if (error) throw error;
    
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error extending meal plan expiration:', error);
    return { data: null, error };
  }
};
