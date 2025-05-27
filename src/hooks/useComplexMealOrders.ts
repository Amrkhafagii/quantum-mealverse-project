
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IngredientAvailabilityCheck {
  ingredient_name: string;
  required_quantity: number;
  available_quantity: number;
  is_sufficient: boolean;
  substitution_suggested?: string;
  notes?: string;
}

export interface PreparationInstruction {
  instruction_type: 'cooking' | 'plating' | 'packaging' | 'dietary' | 'special';
  instruction_text: string;
  priority_level: number;
  estimated_time_minutes?: number;
  requires_special_equipment: boolean;
  equipment_needed: string[];
  chef_notes?: string;
  customer_notes?: string;
}

export interface OrderComplexityAnalysis {
  total_meals: number;
  simple_meals: number;
  moderate_meals: number;
  complex_meals: number;
  total_preparation_time: number;
  estimated_completion_time: string;
  kitchen_load_factor: number;
  special_requirements: string[];
  dietary_restrictions: string[];
  requires_chef_attention: boolean;
  complexity_score: number;
}

export interface ComplexMealOrderData {
  availabilityChecks: IngredientAvailabilityCheck[];
  cookingInstructions: PreparationInstruction[];
  complexityAnalysis: OrderComplexityAnalysis | null;
  canFulfill: boolean;
  loading: boolean;
  error: string | null;
}

export const useComplexMealOrders = (orderId?: string, restaurantId?: string, mealIds?: string[]) => {
  const [data, setData] = useState<ComplexMealOrderData>({
    availabilityChecks: [],
    cookingInstructions: [],
    complexityAnalysis: null,
    canFulfill: false,
    loading: false,
    error: null
  });

  const checkIngredientAvailability = async (orderIdParam?: string, restaurantIdParam?: string, mealIdsParam?: string[]) => {
    const finalOrderId = orderIdParam || orderId;
    const finalRestaurantId = restaurantIdParam || restaurantId;
    const finalMealIds = mealIdsParam || mealIds;

    if (!finalOrderId || !finalRestaurantId || !finalMealIds || finalMealIds.length === 0) {
      throw new Error('Missing required parameters');
    }

    // Get meal ingredients
    const { data: mealIngredients, error: ingredientsError } = await supabase
      .from('meal_ingredients')
      .select('*')
      .in('meal_id', finalMealIds);

    if (ingredientsError) throw ingredientsError;

    // Get restaurant inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('restaurant_ingredient_inventory')
      .select('*')
      .eq('restaurant_id', finalRestaurantId)
      .eq('is_available', true);

    if (inventoryError) throw inventoryError;

    // Calculate availability checks
    const availabilityChecks: IngredientAvailabilityCheck[] = [];
    const ingredientRequirements = new Map<string, number>();

    mealIngredients?.forEach(ingredient => {
      const current = ingredientRequirements.get(ingredient.ingredient_name) || 0;
      ingredientRequirements.set(ingredient.ingredient_name, current + ingredient.quantity);
    });

    for (const [ingredientName, requiredQuantity] of ingredientRequirements) {
      const inventoryItem = inventory?.find(item => item.ingredient_name === ingredientName);
      const availableQuantity = inventoryItem?.current_stock || 0;
      const isSufficient = availableQuantity >= requiredQuantity;

      availabilityChecks.push({
        ingredient_name: ingredientName,
        required_quantity: requiredQuantity,
        available_quantity: availableQuantity,
        is_sufficient: isSufficient,
        substitution_suggested: !isSufficient ? 'Consider alternative ingredients' : undefined,
        notes: !isSufficient ? `Short by ${requiredQuantity - availableQuantity} units` : undefined
      });
    }

    return availabilityChecks;
  };

  const generateCookingInstructions = async (orderIdParam?: string, mealIdsParam?: string[]) => {
    const finalOrderId = orderIdParam || orderId;
    const finalMealIds = mealIdsParam || mealIds;

    if (!finalOrderId || !finalMealIds || finalMealIds.length === 0) {
      throw new Error('Missing required parameters');
    }

    // Get meals with their details
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('id, name, cooking_instructions, complexity_level, dietary_tags, allergen_warnings')
      .in('id', finalMealIds);

    if (mealsError) throw mealsError;

    const instructions: PreparationInstruction[] = [];

    for (const meal of meals || []) {
      const cookingInstructions = meal.cooking_instructions as any[];
      
      // Generate cooking instructions
      if (cookingInstructions && Array.isArray(cookingInstructions)) {
        cookingInstructions.forEach((instruction, index) => {
          instructions.push({
            instruction_type: 'cooking',
            instruction_text: `${meal.name} - Step ${instruction.step}: ${instruction.instruction}`,
            priority_level: meal.complexity_level === 'complex' ? 5 : meal.complexity_level === 'moderate' ? 3 : 1,
            estimated_time_minutes: instruction.time || 5,
            requires_special_equipment: meal.complexity_level === 'complex',
            equipment_needed: meal.complexity_level === 'complex' ? ['Wok', 'High-heat burner'] : [],
            chef_notes: meal.complexity_level === 'complex' ? 'Requires experienced chef attention' : undefined
          });
        });
      }

      // Generate dietary instructions if needed
      if (meal.dietary_tags && meal.dietary_tags.length > 0) {
        instructions.push({
          instruction_type: 'dietary',
          instruction_text: `Dietary requirements: ${meal.dietary_tags.join(', ')}`,
          priority_level: 4,
          requires_special_equipment: false,
          equipment_needed: [],
          chef_notes: 'Ensure dietary restrictions are followed'
        });
      }

      // Generate allergen warnings
      if (meal.allergen_warnings && meal.allergen_warnings.length > 0) {
        instructions.push({
          instruction_type: 'special',
          instruction_text: `ALLERGEN WARNING: Contains ${meal.allergen_warnings.join(', ')}`,
          priority_level: 5,
          requires_special_equipment: false,
          equipment_needed: [],
          chef_notes: 'Cross-contamination prevention required'
        });
      }

      // Generate plating instruction
      instructions.push({
        instruction_type: 'plating',
        instruction_text: `Plate ${meal.name} according to presentation standards`,
        priority_level: 2,
        estimated_time_minutes: 3,
        requires_special_equipment: false,
        equipment_needed: []
      });

      // Generate packaging instruction
      instructions.push({
        instruction_type: 'packaging',
        instruction_text: `Package ${meal.name} for delivery - maintain temperature`,
        priority_level: 1,
        estimated_time_minutes: 2,
        requires_special_equipment: false,
        equipment_needed: ['Insulated containers']
      });
    }

    return instructions;
  };

  const calculatePreparationTime = async (restaurantIdParam?: string, mealIdsParam?: string[]) => {
    const finalRestaurantId = restaurantIdParam || restaurantId;
    const finalMealIds = mealIdsParam || mealIds;

    if (!finalRestaurantId || !finalMealIds || finalMealIds.length === 0) {
      throw new Error('Missing required parameters');
    }

    // Get preparation estimates
    const { data: estimates, error: estimatesError } = await supabase
      .from('meal_preparation_estimates')
      .select('*')
      .eq('restaurant_id', finalRestaurantId)
      .in('meal_id', finalMealIds);

    if (estimatesError) throw estimatesError;

    let totalTime = 0;
    const currentHour = new Date().getHours();
    const isPeakHours = (currentHour >= 11 && currentHour <= 14) || (currentHour >= 18 && currentHour <= 21);

    estimates?.forEach(estimate => {
      let mealTime = estimate.base_prep_time + estimate.ingredient_prep_time + estimate.cooking_time + estimate.plating_time;
      
      // Apply complexity multiplier
      mealTime *= estimate.complexity_multiplier;
      
      // Apply peak hours multiplier
      if (isPeakHours) {
        mealTime *= 1.3;
      }

      totalTime += Math.ceil(mealTime);
    });

    // Account for parallel cooking
    const parallelFactor = Math.min(finalMealIds.length, 3);
    totalTime = Math.ceil(totalTime / parallelFactor);

    const estimatedCompletion = new Date();
    estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + totalTime);

    return {
      totalTime,
      estimatedCompletion
    };
  };

  const analyzeOrderComplexity = async (orderIdParam?: string, restaurantIdParam?: string, mealIdsParam?: string[]) => {
    const finalOrderId = orderIdParam || orderId;
    const finalRestaurantId = restaurantIdParam || restaurantId;
    const finalMealIds = mealIdsParam || mealIds;

    if (!finalOrderId || !finalRestaurantId || !finalMealIds || finalMealIds.length === 0) {
      throw new Error('Missing required parameters');
    }

    // Get meal complexity information
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('complexity_level, dietary_tags, allergen_warnings')
      .in('id', finalMealIds);

    if (mealsError) throw mealsError;

    let simpleMeals = 0;
    let moderateMeals = 0;
    let complexMeals = 0;
    const specialRequirements: string[] = [];
    const dietaryRestrictions: string[] = [];

    meals?.forEach(meal => {
      switch (meal.complexity_level) {
        case 'simple':
          simpleMeals++;
          break;
        case 'moderate':
          moderateMeals++;
          break;
        case 'complex':
          complexMeals++;
          break;
      }

      if (meal.dietary_tags && meal.dietary_tags.length > 0) {
        dietaryRestrictions.push(...meal.dietary_tags);
      }

      if (meal.allergen_warnings && meal.allergen_warnings.length > 0) {
        specialRequirements.push(`Allergen warning: ${meal.allergen_warnings.join(', ')}`);
      }
    });

    const { totalTime, estimatedCompletion } = await calculatePreparationTime(finalRestaurantId, finalMealIds);
    const kitchenLoadFactor = complexMeals > 2 ? 1.5 : moderateMeals > 3 ? 1.2 : 1.0;

    const analysis: OrderComplexityAnalysis = {
      total_meals: finalMealIds.length,
      simple_meals: simpleMeals,
      moderate_meals: moderateMeals,
      complex_meals: complexMeals,
      total_preparation_time: totalTime,
      estimated_completion_time: estimatedCompletion.toISOString(),
      kitchen_load_factor: kitchenLoadFactor,
      special_requirements: [...new Set(specialRequirements)],
      dietary_restrictions: [...new Set(dietaryRestrictions)],
      requires_chef_attention: complexMeals > 0 || dietaryRestrictions.length > 0,
      complexity_score: simpleMeals * 1 + moderateMeals * 2 + complexMeals * 3
    };

    return analysis;
  };

  const processOrder = async (orderIdParam?: string, restaurantIdParam?: string, mealIdsParam?: string[]) => {
    const finalOrderId = orderIdParam || orderId;
    const finalRestaurantId = restaurantIdParam || restaurantId;
    const finalMealIds = mealIdsParam || mealIds;

    if (!finalOrderId || !finalRestaurantId || !finalMealIds || finalMealIds.length === 0) {
      setData(prev => ({ ...prev, error: 'Missing required parameters' }));
      return;
    }

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [availabilityChecks, cookingInstructions, complexityAnalysis] = await Promise.all([
        checkIngredientAvailability(finalOrderId, finalRestaurantId, finalMealIds),
        generateCookingInstructions(finalOrderId, finalMealIds),
        analyzeOrderComplexity(finalOrderId, finalRestaurantId, finalMealIds)
      ]);

      const canFulfill = availabilityChecks.every(check => check.is_sufficient);

      const result = {
        availabilityChecks,
        cookingInstructions,
        complexityAnalysis,
        canFulfill,
        loading: false,
        error: null
      };

      setData(result);
      return result;
    } catch (error) {
      console.error('Error processing complex meal order:', error);
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to process order' 
      }));
      throw error;
    }
  };

  // Auto-process when all required params are available
  useEffect(() => {
    if (orderId && restaurantId && mealIds && mealIds.length > 0) {
      processOrder();
    }
  }, [orderId, restaurantId, mealIds]);

  return {
    data,
    processOrder,
    checkIngredientAvailability,
    generateCookingInstructions,
    calculatePreparationTime,
    analyzeOrderComplexity
  };
};
