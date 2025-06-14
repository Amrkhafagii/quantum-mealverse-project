
import { supabase } from '@/integrations/supabase/client';
import { 
  MealCustomizationOption, 
  IngredientSubstitution, 
  MealPlanCustomization,
  MealCustomizationSummary 
} from '@/types/mealCustomization';

export const saveMealCustomization = async (customization: Partial<MealPlanCustomization>) => {
  try {
    const { error } = await supabase
      .from('meal_plan_customizations')
      .insert({
        meal_plan_customizations_user_id: customization.user_id,
        meal_plan_id: customization.meal_plan_id,
        meal_id: customization.meal_id,
        servings_count: customization.servings_count,
        portion_size_multiplier: customization.portion_size_multiplier,
        dietary_preferences: customization.dietary_preferences,
        ingredient_substitutions: customization.ingredient_substitutions as any,
        special_instructions: customization.special_instructions,
        total_price_adjustment: customization.total_price_adjustment
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
      .eq('meal_plan_customizations_user_id', userId);

    if (error) {
      console.error('Error fetching meal customizations:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      user_id: item.meal_plan_customizations_user_id,
      meal_plan_id: item.meal_plan_id,
      meal_id: item.meal_id,
      servings_count: item.servings_count,
      portion_size_multiplier: item.portion_size_multiplier,
      dietary_preferences: item.dietary_preferences || [],
      ingredient_substitutions: (item.ingredient_substitutions as any) || [],
      special_instructions: item.special_instructions || '',
      total_price_adjustment: item.total_price_adjustment || 0,
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

    return {
      id: data.id,
      user_id: data.meal_plan_customizations_user_id,
      meal_plan_id: data.meal_plan_id,
      meal_id: data.meal_id,
      servings_count: data.servings_count,
      portion_size_multiplier: data.portion_size_multiplier,
      dietary_preferences: data.dietary_preferences || [],
      ingredient_substitutions: (data.ingredient_substitutions as any) || [],
      special_instructions: data.special_instructions || '',
      total_price_adjustment: data.total_price_adjustment || 0,
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
    const { error } = await supabase
      .from('meal_plan_customizations')
      .update({
        servings_count: updates.servings_count,
        portion_size_multiplier: updates.portion_size_multiplier,
        dietary_preferences: updates.dietary_preferences,
        ingredient_substitutions: updates.ingredient_substitutions as any,
        special_instructions: updates.special_instructions,
        total_price_adjustment: updates.total_price_adjustment,
        updated_at: new Date().toISOString()
      })
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

export const getMealCustomizationOptions = async (mealId: string): Promise<MealCustomizationOption[]> => {
  console.log('Mock getMealCustomizationOptions for meal:', mealId);
  return [];
};

export const getIngredientSubstitutions = async (): Promise<IngredientSubstitution[]> => {
  console.log('Mock getIngredientSubstitutions');
  return [];
};

export const getDietaryPreferences = async (): Promise<string[]> => {
  console.log('Mock getDietaryPreferences');
  return ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'];
};

export const calculateCustomizationSummary = async (
  mealId: string,
  servingsCount: number,
  portionMultiplier: number,
  selectedSubstitutions: IngredientSubstitution[],
  selectedOptions: MealCustomizationOption[]
): Promise<MealCustomizationSummary> => {
  console.log('Mock calculateCustomizationSummary');
  return {
    base_price: 10.99,
    total_cost: 10.99 * servingsCount * portionMultiplier,
    nutritional_changes: {
      calories: 500 * servingsCount * portionMultiplier,
      protein: 25 * servingsCount * portionMultiplier,
      carbs: 45 * servingsCount * portionMultiplier,
      fat: 15 * servingsCount * portionMultiplier,
      fiber: 5 * servingsCount * portionMultiplier,
      sodium: 200 * servingsCount * portionMultiplier
    }
  };
};

export const saveMealPlanCustomization = async (customization: Partial<MealPlanCustomization>): Promise<MealPlanCustomization | null> => {
  const result = await saveMealCustomization(customization);
  if (result.success) {
    // Return a mock customization object for successful saves
    return {
      id: 'mock-id',
      meal_plan_id: customization.meal_plan_id || '',
      meal_id: customization.meal_id || '',
      user_id: customization.user_id || '',
      servings_count: customization.servings_count || 1,
      portion_size_multiplier: customization.portion_size_multiplier || 1,
      dietary_preferences: customization.dietary_preferences || [],
      ingredient_substitutions: customization.ingredient_substitutions || [],
      special_instructions: customization.special_instructions || '',
      total_price_adjustment: customization.total_price_adjustment || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  return null;
};

export const MealCustomizationService = {
  saveMealCustomization,
  getUserMealCustomizations,
  getMealCustomizationById,
  updateMealCustomization,
  deleteMealCustomization,
  getMealCustomizationOptions,
  getIngredientSubstitutions,
  getDietaryPreferences,
  calculateCustomizationSummary,
  saveMealPlanCustomization
};
