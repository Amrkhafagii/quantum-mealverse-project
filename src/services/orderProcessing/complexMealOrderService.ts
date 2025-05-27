
import { supabase } from '@/integrations/supabase/client';

export interface MealIngredient {
  id: string;
  meal_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  is_optional: boolean;
  substitution_group?: string;
  preparation_notes?: string;
  allergen_info: string[];
}

export interface RestaurantInventory {
  id: string;
  restaurant_id: string;
  ingredient_name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  cost_per_unit: number;
  is_available: boolean;
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

export interface IngredientAvailabilityCheck {
  ingredient_name: string;
  required_quantity: number;
  available_quantity: number;
  is_sufficient: boolean;
  substitution_suggested?: string;
  notes?: string;
}

export class ComplexMealOrderService {
  /**
   * Check ingredient availability for all meals in an order
   */
  static async checkIngredientAvailability(
    orderId: string,
    restaurantId: string,
    mealIds: string[]
  ): Promise<IngredientAvailabilityCheck[]> {
    const availabilityChecks: IngredientAvailabilityCheck[] = [];

    try {
      // Get all required ingredients for the meals
      const { data: mealIngredients, error: ingredientsError } = await supabase
        .from('meal_ingredients')
        .select('*')
        .in('meal_id', mealIds);

      if (ingredientsError) {
        console.error('Error fetching meal ingredients:', ingredientsError);
        throw ingredientsError;
      }

      // Get restaurant inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from('restaurant_ingredient_inventory')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true);

      if (inventoryError) {
        console.error('Error fetching restaurant inventory:', inventoryError);
        throw inventoryError;
      }

      // Group ingredients by name and sum quantities
      const ingredientRequirements = new Map<string, number>();
      mealIngredients?.forEach(ingredient => {
        const current = ingredientRequirements.get(ingredient.ingredient_name) || 0;
        ingredientRequirements.set(ingredient.ingredient_name, current + ingredient.quantity);
      });

      // Check availability for each ingredient
      for (const [ingredientName, requiredQuantity] of ingredientRequirements) {
        const inventoryItem = inventory?.find(item => item.ingredient_name === ingredientName);
        
        const availableQuantity = inventoryItem?.current_stock || 0;
        const isSufficient = availableQuantity >= requiredQuantity;
        
        const check: IngredientAvailabilityCheck = {
          ingredient_name: ingredientName,
          required_quantity: requiredQuantity,
          available_quantity: availableQuantity,
          is_sufficient: isSufficient,
          substitution_suggested: !isSufficient ? 'Consider alternative ingredients' : undefined,
          notes: !isSufficient ? `Short by ${requiredQuantity - availableQuantity} ${inventoryItem?.unit || 'units'}` : undefined
        };

        availabilityChecks.push(check);

        // Log the availability check
        await supabase
          .from('ingredient_availability_checks')
          .insert({
            order_id: orderId,
            restaurant_id: restaurantId,
            meal_id: mealIds[0], // Use first meal for logging
            ingredient_name: ingredientName,
            required_quantity: requiredQuantity,
            available_quantity: availableQuantity,
            is_sufficient: isSufficient,
            substitution_suggested: check.substitution_suggested,
            notes: check.notes
          });
      }

      return availabilityChecks;
    } catch (error) {
      console.error('Error checking ingredient availability:', error);
      throw error;
    }
  }

  /**
   * Generate cooking instructions for an order
   */
  static async generateCookingInstructions(
    orderId: string,
    mealIds: string[]
  ): Promise<PreparationInstruction[]> {
    const instructions: PreparationInstruction[] = [];

    try {
      // Get meals with their cooking instructions
      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('id, name, cooking_instructions, complexity_level, dietary_tags, allergen_warnings')
        .in('id', mealIds);

      if (mealsError) {
        console.error('Error fetching meals:', mealsError);
        throw mealsError;
      }

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

      // Save instructions to database
      for (const instruction of instructions) {
        for (const mealId of mealIds) {
          await supabase
            .from('order_preparation_instructions')
            .insert({
              order_id: orderId,
              meal_id: mealId,
              instruction_type: instruction.instruction_type,
              instruction_text: instruction.instruction_text,
              priority_level: instruction.priority_level,
              estimated_time_minutes: instruction.estimated_time_minutes,
              requires_special_equipment: instruction.requires_special_equipment,
              equipment_needed: instruction.equipment_needed,
              chef_notes: instruction.chef_notes,
              customer_notes: instruction.customer_notes
            });
        }
      }

      return instructions;
    } catch (error) {
      console.error('Error generating cooking instructions:', error);
      throw error;
    }
  }

  /**
   * Calculate preparation time estimate for an order
   */
  static async calculatePreparationTime(
    restaurantId: string,
    mealIds: string[]
  ): Promise<{ totalTime: number; estimatedCompletion: Date }> {
    try {
      // Get preparation estimates for meals
      const { data: estimates, error: estimatesError } = await supabase
        .from('meal_preparation_estimates')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .in('meal_id', mealIds);

      if (estimatesError) {
        console.error('Error fetching preparation estimates:', estimatesError);
        throw estimatesError;
      }

      // Calculate total preparation time
      let totalTime = 0;
      const currentHour = new Date().getHours();
      const isPeakHours = currentHour >= 11 && currentHour <= 14 || currentHour >= 18 && currentHour <= 21;

      estimates?.forEach(estimate => {
        let mealTime = estimate.total_estimated_time;
        
        // Apply peak hours multiplier
        if (isPeakHours) {
          mealTime *= estimate.peak_hours_multiplier;
        }

        // Apply kitchen capacity factor
        mealTime *= estimate.kitchen_capacity_factor;

        totalTime += Math.ceil(mealTime);
      });

      // If no estimates found, use default calculation
      if (!estimates || estimates.length === 0) {
        const { data: meals, error: mealsError } = await supabase
          .from('meals')
          .select('preparation_time, complexity_level')
          .in('id', mealIds);

        if (mealsError) {
          console.error('Error fetching meals for time calculation:', mealsError);
          throw mealsError;
        }

        meals?.forEach(meal => {
          let baseTime = meal.preparation_time;
          
          // Apply complexity multiplier
          if (meal.complexity_level === 'complex') {
            baseTime *= 1.8;
          } else if (meal.complexity_level === 'moderate') {
            baseTime *= 1.2;
          }

          // Apply peak hours multiplier
          if (isPeakHours) {
            baseTime *= 1.2;
          }

          totalTime += Math.ceil(baseTime);
        });
      }

      // Account for parallel cooking (meals can be prepared simultaneously)
      const parallelFactor = Math.min(mealIds.length, 3); // Max 3 meals can be prepared in parallel
      totalTime = Math.ceil(totalTime / parallelFactor);

      const estimatedCompletion = new Date();
      estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + totalTime);

      return {
        totalTime,
        estimatedCompletion
      };
    } catch (error) {
      console.error('Error calculating preparation time:', error);
      throw error;
    }
  }

  /**
   * Analyze order complexity
   */
  static async analyzeOrderComplexity(
    orderId: string,
    restaurantId: string,
    mealIds: string[]
  ): Promise<OrderComplexityAnalysis> {
    try {
      // Get meal complexity information
      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('complexity_level, dietary_tags, allergen_warnings')
        .in('id', mealIds);

      if (mealsError) {
        console.error('Error fetching meals for complexity analysis:', mealsError);
        throw mealsError;
      }

      let simpleMeals = 0;
      let moderateMeals = 0;
      let complexMeals = 0;
      const specialRequirements: string[] = [];
      const dietaryRestrictions: string[] = [];

      meals?.forEach(meal => {
        // Count complexity levels
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

        // Collect dietary requirements
        if (meal.dietary_tags && meal.dietary_tags.length > 0) {
          dietaryRestrictions.push(...meal.dietary_tags);
        }

        // Collect allergen warnings as special requirements
        if (meal.allergen_warnings && meal.allergen_warnings.length > 0) {
          specialRequirements.push(`Allergen warning: ${meal.allergen_warnings.join(', ')}`);
        }
      });

      // Calculate preparation time
      const { totalTime, estimatedCompletion } = await this.calculatePreparationTime(restaurantId, mealIds);

      // Determine kitchen load factor (simplified)
      const kitchenLoadFactor = complexMeals > 2 ? 1.5 : moderateMeals > 3 ? 1.2 : 1.0;

      const analysis: OrderComplexityAnalysis = {
        total_meals: mealIds.length,
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

      // Save analysis to database
      await supabase
        .from('order_complexity_analysis')
        .insert({
          order_id: orderId,
          restaurant_id: restaurantId,
          total_meals: analysis.total_meals,
          simple_meals: analysis.simple_meals,
          moderate_meals: analysis.moderate_meals,
          complex_meals: analysis.complex_meals,
          total_preparation_time: analysis.total_preparation_time,
          estimated_completion_time: analysis.estimated_completion_time,
          kitchen_load_factor: analysis.kitchen_load_factor,
          special_requirements: analysis.special_requirements,
          dietary_restrictions: analysis.dietary_restrictions,
          requires_chef_attention: analysis.requires_chef_attention
        });

      return analysis;
    } catch (error) {
      console.error('Error analyzing order complexity:', error);
      throw error;
    }
  }

  /**
   * Process a complex meal order
   */
  static async processComplexMealOrder(
    orderId: string,
    restaurantId: string,
    mealIds: string[]
  ): Promise<{
    availabilityChecks: IngredientAvailabilityCheck[];
    cookingInstructions: PreparationInstruction[];
    complexityAnalysis: OrderComplexityAnalysis;
    canFulfill: boolean;
  }> {
    try {
      console.log(`Processing complex meal order ${orderId} for restaurant ${restaurantId}`);

      // 1. Check ingredient availability
      const availabilityChecks = await this.checkIngredientAvailability(orderId, restaurantId, mealIds);

      // 2. Generate cooking instructions
      const cookingInstructions = await this.generateCookingInstructions(orderId, mealIds);

      // 3. Analyze order complexity
      const complexityAnalysis = await this.analyzeOrderComplexity(orderId, restaurantId, mealIds);

      // 4. Determine if order can be fulfilled
      const canFulfill = availabilityChecks.every(check => check.is_sufficient);

      console.log(`Order ${orderId} processing complete. Can fulfill: ${canFulfill}`);

      return {
        availabilityChecks,
        cookingInstructions,
        complexityAnalysis,
        canFulfill
      };
    } catch (error) {
      console.error('Error processing complex meal order:', error);
      throw error;
    }
  }

  /**
   * Update restaurant inventory after order processing
   */
  static async updateInventoryAfterOrder(
    restaurantId: string,
    usedIngredients: { name: string; quantity: number }[]
  ): Promise<void> {
    try {
      for (const ingredient of usedIngredients) {
        await supabase
          .from('restaurant_ingredient_inventory')
          .update({
            current_stock: supabase.raw(`current_stock - ${ingredient.quantity}`),
            updated_at: new Date().toISOString()
          })
          .eq('restaurant_id', restaurantId)
          .eq('ingredient_name', ingredient.name);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }
}
