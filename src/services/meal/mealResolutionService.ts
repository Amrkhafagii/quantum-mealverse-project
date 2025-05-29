
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';

export interface ResolvedMealItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  meal_id: string;
}

export class MealResolutionService {
  static async resolveCartItemsToMeals(
    cartItems: CartItem[],
    restaurantId: string
  ): Promise<ResolvedMealItem[]> {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required for meal resolution');
    }

    console.log('=== MEAL RESOLUTION DEBUG START ===');
    console.log('Starting meal resolution:', {
      itemCount: cartItems.length,
      restaurantId,
      items: cartItems.map(item => ({ id: item.id, name: item.name, price: item.price }))
    });

    // First validate that the restaurant exists
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, is_active')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      console.error('Restaurant validation failed:', restaurantError);
      throw new Error(`Invalid restaurant ID: ${restaurantId}`);
    }

    if (!restaurant.is_active) {
      console.error('Restaurant is not active:', restaurant);
      throw new Error(`Restaurant "${restaurant.name}" is not currently active`);
    }

    console.log('Restaurant validated:', restaurant);

    const resolvedItems: ResolvedMealItem[] = [];

    for (const [index, item] of cartItems.entries()) {
      try {
        console.log(`Processing item ${index + 1}/${cartItems.length}: "${item.name}"`);

        // First, try to find existing meal
        let mealId = await this.findExistingMeal(item.name, restaurantId);
        
        if (mealId) {
          console.log(`Found existing meal for "${item.name}": ${mealId}`);
        } else {
          console.log(`No existing meal found for "${item.name}", creating new meal...`);
          mealId = await this.createMealRecord(item, restaurantId);
          
          if (!mealId) {
            throw new Error(`Failed to create meal record for "${item.name}" - no meal ID returned`);
          }
          
          console.log(`Created new meal for "${item.name}": ${mealId}`);
        }

        // Validate that the meal ID actually exists in the database
        const isValidMeal = await this.validateMealExists(mealId);
        if (!isValidMeal) {
          throw new Error(`Meal validation failed for "${item.name}" - meal ID ${mealId} does not exist in database`);
        }

        const resolvedItem: ResolvedMealItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          meal_id: mealId
        };

        resolvedItems.push(resolvedItem);
        console.log(`Successfully resolved item ${index + 1}: "${item.name}" -> meal_id: ${mealId}`);

      } catch (error) {
        console.error(`Failed to resolve item ${index + 1} "${item.name}":`, error);
        throw new Error(`Failed to resolve meal "${item.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('=== MEAL RESOLUTION DEBUG END (SUCCESS) ===');
    console.log('Final resolved items:', resolvedItems);
    return resolvedItems;
  }

  private static async findExistingMeal(
    mealName: string,
    restaurantId: string
  ): Promise<string | null> {
    console.log(`Searching for existing meal: "${mealName}" in restaurant: ${restaurantId}`);

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name')
        .eq('name', mealName)
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`No existing meal found for "${mealName}"`);
          return null;
        } else {
          console.error('Database error while searching for existing meal:', error);
          throw new Error(`Database error: ${error.message}`);
        }
      }

      console.log(`Found existing meal:`, { id: data.id, name: data.name });
      return data.id;

    } catch (error) {
      console.error('Error in findExistingMeal:', error);
      throw error;
    }
  }

  private static async createMealRecord(
    cartItem: CartItem,
    restaurantId: string
  ): Promise<string> {
    console.log(`Creating new meal record for: "${cartItem.name}" in restaurant: ${restaurantId}`);

    try {
      const mealData = {
        name: cartItem.name,
        description: cartItem.description || `Nutritionally optimized meal: ${cartItem.name}`,
        price: cartItem.price,
        restaurant_id: restaurantId,
        category: 'Generated Meals',
        is_available: true,
        nutritional_info: cartItem.calories || cartItem.protein || cartItem.carbs || cartItem.fat ? {
          calories: cartItem.calories,
          protein: cartItem.protein,
          carbs: cartItem.carbs,
          fat: cartItem.fat
        } : null,
        preparation_time: cartItem.estimated_prep_time || 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Meal data to insert:', mealData);

      const { data, error } = await supabase
        .from('menu_items')
        .insert(mealData)
        .select('id, name')
        .single();

      if (error) {
        console.error('Database error while creating meal:', error);
        
        // Check if it's a permission error
        if (error.code === '42501' || error.message?.includes('permission denied')) {
          throw new Error(`Permission denied: Cannot create meals in database. Please contact support.`);
        }
        
        // Check if it's a foreign key constraint error
        if (error.code === '23503') {
          throw new Error(`Invalid restaurant reference: Restaurant ${restaurantId} may not exist.`);
        }
        
        throw new Error(`Failed to create meal in database: ${error.message}`);
      }

      if (!data?.id) {
        console.error('No ID returned from meal creation');
        throw new Error('Failed to create meal record - no ID returned from database');
      }

      console.log(`Successfully created meal:`, { id: data.id, name: data.name });
      return data.id;

    } catch (error) {
      console.error('Error in createMealRecord:', error);
      throw error;
    }
  }

  private static async validateMealExists(mealId: string): Promise<boolean> {
    console.log('Validating meal exists:', mealId);

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id')
        .eq('id', mealId)
        .single();

      if (error) {
        console.error('Error validating meal existence:', error);
        return false;
      }

      const exists = !!data;
      console.log('Meal validation result:', { mealId, exists });
      return exists;
    } catch (error) {
      console.error('Exception during meal validation:', error);
      return false;
    }
  }

  static async validateMealIds(mealIds: string[]): Promise<boolean> {
    console.log('Validating meal IDs:', mealIds);

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id')
        .in('id', mealIds);

      if (error) {
        console.error('Error validating meal IDs:', error);
        return false;
      }

      const isValid = data.length === mealIds.length;
      console.log('Meal ID validation result:', { requested: mealIds.length, found: data.length, isValid });
      
      return isValid;
    } catch (error) {
      console.error('Exception during meal ID validation:', error);
      return false;
    }
  }
}
