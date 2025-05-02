
import { supabase } from '@/integrations/supabase/client';
import { SavedMealPlan } from '@/types/fitness';
import { MealPlan } from '@/types/food';
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
    
    const { data, error } = await supabase.from('saved_meal_plans').insert({
      id: uuidv4(),
      user_id: userId,
      name,
      date_created: now.toISOString(),
      tdee_id: tdeeId,
      meal_plan: mealPlan,
      expires_at: expiresAt.toISOString(),
      is_active: true
    });

    if (error) throw error;

    return {
      success: true,
      mealPlanId: data ? data[0]?.id : undefined
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
