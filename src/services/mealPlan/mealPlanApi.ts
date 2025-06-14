
import { supabase } from '@/integrations/supabase/client';

interface SavedMealPlan {
  id?: string;
  user_id: string;
  name: string;
  meal_plan: any;
  tdee_id?: string;
  date_created?: string;
  is_active?: boolean;
}

export const saveMealPlan = async (userId: string, name: string, mealPlan: any, tdeeId?: string) => {
  try {
    const { error } = await supabase
      .from('saved_meal_plans')
      .insert({
        saved_meal_plans_user_id: userId,
        name: name,
        meal_plan: mealPlan,
        tdee_id: tdeeId,
        date_created: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving meal plan:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in saveMealPlan:', error);
    return { success: false, error: 'Failed to save meal plan' };
  }
};

export const getUserMealPlans = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_meal_plans')
      .select('*')
      .eq('saved_meal_plans_user_id', userId)
      .order('date_created', { ascending: false });

    if (error) {
      console.error('Error fetching meal plans:', error);
      return { data: [], error: error.message };
    }

    const plans = (data || []).map(plan => ({
      id: plan.id,
      user_id: plan.saved_meal_plans_user_id,
      name: plan.name,
      meal_plan: plan.meal_plan,
      tdee_id: plan.tdee_id,
      date_created: plan.date_created,
      is_active: true
    }));

    return { data: plans, error: null };
  } catch (error) {
    console.error('Error in getUserMealPlans:', error);
    return { data: [], error: 'Failed to fetch meal plans' };
  }
};

export const getUserSavedMealPlans = async (userId: string) => {
  return await getUserMealPlans(userId);
};

export const deleteMealPlan = async (planId: string) => {
  try {
    const { error } = await supabase
      .from('saved_meal_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting meal plan:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteMealPlan:', error);
    return { success: false, error: 'Failed to delete meal plan' };
  }
};

export const deleteSavedMealPlan = async (planId: string, userId?: string) => {
  return await deleteMealPlan(planId);
};

export const renewMealPlan = async (planId: string) => {
  try {
    console.log('Renewing meal plan:', planId);
    return { success: true };
  } catch (error) {
    console.error('Error renewing meal plan:', error);
    return { success: false, error: 'Failed to renew meal plan' };
  }
};
