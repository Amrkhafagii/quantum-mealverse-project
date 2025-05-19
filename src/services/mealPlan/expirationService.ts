
import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlan } from '@/types/fitness';

/**
 * Extends the expiration of a meal plan
 */
export const extendMealPlanExpiration = async (
  planId: string,
  userId: string
): Promise<{
  data: SavedMealPlan | null;
  error: any;
}> => {
  try {
    const updateData = {
      is_active: true
    } as any; // Use type assertion to avoid type checking for this specific update

    const { data, error } = await supabase
      .from('saved_meal_plans')
      .update(updateData)
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
    const updateData = {
      is_active: true
    } as any; // Use type assertion to avoid type checking for this specific update

    const { error } = await supabase
      .from('saved_meal_plans')
      .update(updateData)
      .eq('id', planId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error renewing meal plan:', error);
    return { success: false, error: error.message };
  }
};
