
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';

export interface ResolvedMealItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  meal_id: string; // The actual database meal ID
}

export class MealResolutionService {
  /**
   * Resolves cart items to actual meal database records
   * Either finds existing meals or creates new ones
   */
  static async resolveCartItemsToMeals(
    cartItems: CartItem[],
    restaurantId?: string
  ): Promise<ResolvedMealItem[]> {
    const resolvedItems: ResolvedMealItem[] = [];

    for (const item of cartItems) {
      try {
        // First, try to find existing meal by name and restaurant
        let mealId = await this.findExistingMeal(item.name, item.restaurant_id || restaurantId);
        
        // If not found, create a new meal record
        if (!mealId) {
          mealId = await this.createMealRecord(item, item.restaurant_id || restaurantId);
        }

        resolvedItems.push({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          meal_id: mealId
        });

        console.log(`Resolved cart item "${item.name}" to meal_id: ${mealId}`);
      } catch (error) {
        console.error(`Failed to resolve cart item "${item.name}":`, error);
        throw new Error(`Failed to resolve meal for item: ${item.name}`);
      }
    }

    return resolvedItems;
  }

  /**
   * Find existing meal by name and restaurant
   */
  private static async findExistingMeal(
    mealName: string,
    restaurantId?: string
  ): Promise<string | null> {
    console.log(`Looking for existing meal: "${mealName}" in restaurant: ${restaurantId}`);

    const query = supabase
      .from('menu_items')
      .select('id')
      .eq('name', mealName)
      .eq('is_available', true);

    // If we have a restaurant ID, filter by it
    if (restaurantId) {
      query.eq('restaurant_id', restaurantId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error finding existing meal:', error);
      throw error;
    }

    return data?.id || null;
  }

  /**
   * Create a new meal record in the menu_items table
   */
  private static async createMealRecord(
    cartItem: CartItem,
    restaurantId?: string
  ): Promise<string> {
    console.log(`Creating new meal record for: "${cartItem.name}"`);

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

    const { data, error } = await supabase
      .from('menu_items')
      .insert(mealData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating meal record:', error);
      throw error;
    }

    if (!data?.id) {
      throw new Error('Failed to create meal record - no ID returned');
    }

    console.log(`Created new meal record with ID: ${data.id}`);
    return data.id;
  }

  /**
   * Validate that all meal IDs exist in the database
   */
  static async validateMealIds(mealIds: string[]): Promise<boolean> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id')
      .in('id', mealIds);

    if (error) {
      console.error('Error validating meal IDs:', error);
      return false;
    }

    return data.length === mealIds.length;
  }
}
