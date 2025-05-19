
import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlan } from '@/types/fitness';
import { MealPlan } from '@/types/food';
import { Json } from '@/types/database';
import { SavedMealPlanExtended } from './types';

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
  updates: Partial<SavedMealPlanExtended>
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
