
import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlan } from '@/types/fitness';

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
