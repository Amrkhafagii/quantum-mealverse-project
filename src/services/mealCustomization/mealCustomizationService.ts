
import { supabase } from '@/integrations/supabase/client';

interface MealPlanCustomization {
  id?: string;
  user_id: string;
  meal_id?: string;
  meal_plan_id?: string;
  dietary_preferences?: string[];
  ingredient_substitutions?: any;
  portion_size_multiplier?: number;
  servings_count?: number;
  special_instructions?: string;
  total_price_adjustment?: number;
  created_at?: string;
  updated_at?: string;
}

export const saveMealCustomization = async (customization: MealPlanCustomization) => {
  try {
    const { error } = await supabase
      .from('meal_plan_customizations')
      .insert({
        meal_plan_customizations_user_id: customization.user_id,
        meal_id: customization.meal_id,
        meal_plan_id: customization.meal_plan_id,
        dietary_preferences: customization.dietary_preferences || [],
        ingredient_substitutions: customization.ingredient_substitutions || {},
        portion_size_multiplier: customization.portion_size_multiplier || 1,
        servings_count: customization.servings_count || 1,
        special_instructions: customization.special_instructions || '',
        total_price_adjustment: customization.total_price_adjustment || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving meal customization:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in saveMealCustomization:', error);
    return { success: false, error: 'Failed to save customization' };
  }
};

export const getUserMealCustomizations = async (userId: string): Promise<MealPlanCustomization[]> => {
  try {
    const { data, error } = await supabase
      .from('meal_plan_customizations')
      .select('*')
      .eq('meal_plan_customizations_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching meal customizations:', error);
      return [];
    }

    // Map database fields to application format
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.meal_plan_customizations_user_id,
      meal_id: item.meal_id,
      meal_plan_id: item.meal_plan_id,
      dietary_preferences: item.dietary_preferences,
      ingredient_substitutions: item.ingredient_substitutions,
      portion_size_multiplier: item.portion_size_multiplier,
      servings_count: item.servings_count,
      special_instructions: item.special_instructions,
      total_price_adjustment: item.total_price_adjustment,
      created_at: item.created_at,
      updated_at: item.updated_at
    })) as MealPlanCustomization[];
  } catch (error) {
    console.error('Error in getUserMealCustomizations:', error);
    return [];
  }
};

export const getMealCustomizationById = async (customizationId: string): Promise<MealPlanCustomization | null> => {
  try {
    const { data, error } = await supabase
      .from('meal_plan_customizations')
      .select('*')
      .eq('id', customizationId)
      .single();

    if (error) {
      console.error('Error fetching meal customization:', error);
      return null;
    }

    if (!data) return null;

    // Map database fields to application format
    return {
      id: data.id,
      user_id: data.meal_plan_customizations_user_id,
      meal_id: data.meal_id,
      meal_plan_id: data.meal_plan_id,
      dietary_preferences: data.dietary_preferences,
      ingredient_substitutions: data.ingredient_substitutions,
      portion_size_multiplier: data.portion_size_multiplier,
      servings_count: data.servings_count,
      special_instructions: data.special_instructions,
      total_price_adjustment: data.total_price_adjustment,
      created_at: data.created_at,
      updated_at: data.updated_at
    } as MealPlanCustomization;
  } catch (error) {
    console.error('Error in getMealCustomizationById:', error);
    return null;
  }
};

export const updateMealCustomization = async (customizationId: string, updates: Partial<MealPlanCustomization>) => {
  try {
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };

    // Only include fields that exist in the database
    if (updates.meal_id !== undefined) dbUpdates.meal_id = updates.meal_id;
    if (updates.meal_plan_id !== undefined) dbUpdates.meal_plan_id = updates.meal_plan_id;
    if (updates.dietary_preferences !== undefined) dbUpdates.dietary_preferences = updates.dietary_preferences;
    if (updates.ingredient_substitutions !== undefined) dbUpdates.ingredient_substitutions = updates.ingredient_substitutions;
    if (updates.portion_size_multiplier !== undefined) dbUpdates.portion_size_multiplier = updates.portion_size_multiplier;
    if (updates.servings_count !== undefined) dbUpdates.servings_count = updates.servings_count;
    if (updates.special_instructions !== undefined) dbUpdates.special_instructions = updates.special_instructions;
    if (updates.total_price_adjustment !== undefined) dbUpdates.total_price_adjustment = updates.total_price_adjustment;

    const { error } = await supabase
      .from('meal_plan_customizations')
      .update(dbUpdates)
      .eq('id', customizationId);

    if (error) {
      console.error('Error updating meal customization:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateMealCustomization:', error);
    return { success: false, error: 'Failed to update customization' };
  }
};

export const deleteMealCustomization = async (customizationId: string) => {
  try {
    const { error } = await supabase
      .from('meal_plan_customizations')
      .delete()
      .eq('id', customizationId);

    if (error) {
      console.error('Error deleting meal customization:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteMealCustomization:', error);
    return { success: false, error: 'Failed to delete customization' };
  }
};

// Export service object for backwards compatibility
export const MealCustomizationService = {
  saveMealCustomization,
  getUserMealCustomizations,
  getMealCustomizationById,
  updateMealCustomization,
  deleteMealCustomization
};
