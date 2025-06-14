
import { supabase } from '@/integrations/supabase/client';
import { 
  MealCustomizationOption, 
  IngredientSubstitution, 
  MealPlanCustomization, 
  MealCustomizationSummary 
} from '@/types/mealCustomization';

export class MealCustomizationService {
  /**
   * Get all customization options for a specific meal
   */
  static async getMealCustomizationOptions(mealId: string): Promise<MealCustomizationOption[]> {
    try {
      const { data, error } = await supabase
        .from('meal_customization_options')
        .select('*')
        .eq('meal_id', mealId)
        .eq('is_active', true)
        .order('customization_type', { ascending: true });

      if (error) {
        console.error('Error fetching meal customization options:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        customization_type: item.customization_type as MealCustomizationOption['customization_type']
      }));
    } catch (error) {
      console.error('Error in getMealCustomizationOptions:', error);
      return [];
    }
  }

  /**
   * Get available ingredient substitutions
   */
  static async getIngredientSubstitutions(originalIngredient?: string): Promise<IngredientSubstitution[]> {
    try {
      let query = supabase
        .from('ingredient_substitutions')
        .select('*')
        .eq('is_active', true);

      if (originalIngredient) {
        query = query.eq('original_ingredient', originalIngredient);
      }

      const { data, error } = await query.order('price_adjustment', { ascending: true });

      if (error) {
        console.error('Error fetching ingredient substitutions:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        nutritional_impact: typeof item.nutritional_impact === 'string' 
          ? JSON.parse(item.nutritional_impact) 
          : (item.nutritional_impact || {})
      }));
    } catch (error) {
      console.error('Error in getIngredientSubstitutions:', error);
      return [];
    }
  }

  /**
   * Save meal plan customization
   */
  static async saveMealPlanCustomization(customization: Omit<MealPlanCustomization, 'id' | 'created_at' | 'updated_at'>): Promise<MealPlanCustomization | null> {
    try {
      const dbCustomization = {
        ...customization,
        ingredient_substitutions: JSON.stringify(customization.ingredient_substitutions)
      };

      const { data, error } = await supabase
        .from('meal_plan_customizations')
        .insert(dbCustomization)
        .select()
        .single();

      if (error) {
        console.error('Error saving meal plan customization:', error);
        throw error;
      }

      return {
        ...data,
        ingredient_substitutions: typeof data.ingredient_substitutions === 'string'
          ? JSON.parse(data.ingredient_substitutions)
          : (data.ingredient_substitutions || [])
      };
    } catch (error) {
      console.error('Error in saveMealPlanCustomization:', error);
      return null;
    }
  }

  /**
   * Get meal plan customizations for a user
   */
  static async getMealPlanCustomizations(userId: string, mealPlanId?: string): Promise<MealPlanCustomization[]> {
    try {
      let query = supabase
        .from('meal_plan_customizations')
        .select('*')
        .eq('meal_plan_customizations_user_id', userId);

      if (mealPlanId) {
        query = query.eq('meal_plan_id', mealPlanId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching meal plan customizations:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        ingredient_substitutions: typeof item.ingredient_substitutions === 'string'
          ? JSON.parse(item.ingredient_substitutions)
          : (item.ingredient_substitutions || [])
      }));
    } catch (error) {
      console.error('Error in getMealPlanCustomizations:', error);
      return [];
    }
  }

  /**
   * Calculate customization summary with pricing and nutritional changes
   */
  static async calculateCustomizationSummary(
    mealId: string,
    servingsCount: number,
    portionMultiplier: number,
    selectedSubstitutions: IngredientSubstitution[],
    selectedOptions: MealCustomizationOption[]
  ): Promise<MealCustomizationSummary> {
    try {
      // Get base meal data with nutritional info
      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .select(`
          *,
          nutritional_info (*)
        `)
        .eq('id', mealId)
        .single();

      if (mealError || !mealData) {
        throw new Error('Meal not found');
      }

      const basePrice = mealData.price || 0;
      const baseCost = basePrice * servingsCount;
      
      // Calculate portion adjustment cost
      const portionAdjustment = baseCost * (portionMultiplier - 1);
      
      // Calculate substitution costs
      const substitutionCost = selectedSubstitutions.reduce(
        (sum, sub) => sum + (sub.price_adjustment * servingsCount), 0
      );
      
      // Calculate option costs
      const optionCost = selectedOptions.reduce(
        (sum, option) => sum + (option.price_adjustment * servingsCount), 0
      );
      
      const totalCost = baseCost + portionAdjustment + substitutionCost + optionCost;

      // Calculate nutritional changes
      const nutritionalChanges = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0
      };

      // Apply substitution nutritional impacts
      selectedSubstitutions.forEach(sub => {
        if (sub.nutritional_impact) {
          Object.keys(sub.nutritional_impact).forEach(key => {
            if (key in nutritionalChanges && sub.nutritional_impact![key] !== undefined) {
              nutritionalChanges[key as keyof typeof nutritionalChanges] += 
                sub.nutritional_impact![key]! * servingsCount * portionMultiplier;
            }
          });
        }
      });

      // Apply portion multiplier to base nutritional values
      if (mealData.nutritional_info) {
        const nutritionalData = Array.isArray(mealData.nutritional_info) 
          ? mealData.nutritional_info[0] 
          : mealData.nutritional_info;
        
        if (nutritionalData) {
          nutritionalChanges.calories += (nutritionalData.calories || 0) * servingsCount * (portionMultiplier - 1);
          nutritionalChanges.protein += (nutritionalData.protein || 0) * servingsCount * (portionMultiplier - 1);
          nutritionalChanges.carbs += (nutritionalData.carbs || 0) * servingsCount * (portionMultiplier - 1);
          nutritionalChanges.fat += (nutritionalData.fats || 0) * servingsCount * (portionMultiplier - 1);
          nutritionalChanges.fiber += (nutritionalData.fiber || 0) * servingsCount * (portionMultiplier - 1);
          nutritionalChanges.sodium += (nutritionalData.sodium || 0) * servingsCount * (portionMultiplier - 1);
        }
      }

      return {
        base_price: baseCost,
        portion_adjustment: portionAdjustment,
        substitution_cost: substitutionCost,
        option_cost: optionCost,
        total_cost: totalCost,
        nutritional_changes: nutritionalChanges
      };
    } catch (error) {
      console.error('Error calculating customization summary:', error);
      throw error;
    }
  }

  /**
   * Update meal plan customization
   */
  static async updateMealPlanCustomization(
    id: string, 
    updates: Partial<Omit<MealPlanCustomization, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<MealPlanCustomization | null> {
    try {
      const dbUpdates = {
        ...updates,
        ingredient_substitutions: updates.ingredient_substitutions 
          ? JSON.stringify(updates.ingredient_substitutions)
          : undefined,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('meal_plan_customizations')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating meal plan customization:', error);
        throw error;
      }

      return {
        ...data,
        ingredient_substitutions: typeof data.ingredient_substitutions === 'string'
          ? JSON.parse(data.ingredient_substitutions)
          : (data.ingredient_substitutions || [])
      };
    } catch (error) {
      console.error('Error in updateMealPlanCustomization:', error);
      return null;
    }
  }

  /**
   * Delete meal plan customization
   */
  static async deleteMealPlanCustomization(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('meal_plan_customizations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting meal plan customization:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteMealPlanCustomization:', error);
      return false;
    }
  }

  /**
   * Get all available dietary preferences
   */
  static async getDietaryPreferences(): Promise<string[]> {
    return [
      'Vegetarian',
      'Vegan',
      'Gluten-Free',
      'Dairy-Free',
      'Nut-Free',
      'Keto',
      'Low-Carb',
      'High-Protein',
      'Low-Sodium',
      'Organic',
      'Halal',
      'Kosher'
    ];
  }

  /**
   * Search ingredient substitutions by term
   */
  static async searchIngredientSubstitutions(searchTerm: string): Promise<IngredientSubstitution[]> {
    try {
      const { data, error } = await supabase
        .from('ingredient_substitutions')
        .select('*')
        .or(`original_ingredient.ilike.%${searchTerm}%, substitute_ingredient.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .order('price_adjustment', { ascending: true });

      if (error) {
        console.error('Error searching ingredient substitutions:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        nutritional_impact: typeof item.nutritional_impact === 'string' 
          ? JSON.parse(item.nutritional_impact) 
          : (item.nutritional_impact || {})
      }));
    } catch (error) {
      console.error('Error in searchIngredientSubstitutions:', error);
      return [];
    }
  }
}
