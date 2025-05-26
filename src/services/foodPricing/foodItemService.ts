
import { supabase } from '@/integrations/supabase/client';
import { FoodItem, FoodItemPrice, FoodPricingQuery } from '@/types/foodPricing';

export class FoodItemService {
  /**
   * Get all available food items
   */
  static async getAllFoodItems(): Promise<FoodItem[]> {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching food items:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Search food items by name
   */
  static async searchFoodItems(searchTerm: string): Promise<FoodItem[]> {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('name');

    if (error) {
      console.error('Error searching food items:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get food items by category
   */
  static async getFoodItemsByCategory(category: string): Promise<FoodItem[]> {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('category', category)
      .order('name');

    if (error) {
      console.error('Error fetching food items by category:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get food item pricing for a specific food and restaurant
   */
  static async getFoodItemPricing(
    foodName: string,
    restaurantId?: string,
    quantity: number = 100
  ): Promise<FoodPricingQuery[]> {
    try {
      const { data, error } = await supabase.rpc('get_food_item_pricing', {
        p_food_name: foodName,
        p_restaurant_id: restaurantId,
        p_quantity: quantity
      });

      if (error) {
        console.error('Error fetching food pricing:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFoodItemPricing:', error);
      return [];
    }
  }

  /**
   * Get cheapest price for a food item across all restaurants
   */
  static async getCheapestPrice(foodName: string): Promise<FoodPricingQuery | null> {
    const pricing = await this.getFoodItemPricing(foodName);
    
    if (pricing.length === 0) return null;
    
    return pricing.reduce((cheapest, current) => 
      current.price_per_unit < cheapest.price_per_unit ? current : cheapest
    );
  }

  /**
   * Get all active food item prices for a restaurant
   */
  static async getRestaurantFoodPrices(restaurantId: string): Promise<FoodItemPrice[]> {
    const { data, error } = await supabase
      .from('food_item_prices')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('price_per_unit');

    if (error) {
      console.error('Error fetching restaurant food prices:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Update food item price for a restaurant
   */
  static async updateFoodItemPrice(
    foodItemId: string,
    restaurantId: string,
    pricePerUnit: number,
    minimumOrderQuantity?: number
  ): Promise<FoodItemPrice> {
    const { data, error } = await supabase
      .from('food_item_prices')
      .upsert({
        food_item_id: foodItemId,
        restaurant_id: restaurantId,
        price_per_unit: pricePerUnit,
        minimum_order_quantity: minimumOrderQuantity,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating food item price:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new food item
   */
  static async createFoodItem(foodItem: Omit<FoodItem, 'id' | 'created_at' | 'updated_at'>): Promise<FoodItem> {
    const { data, error } = await supabase
      .from('food_items')
      .insert({
        name: foodItem.name,
        category: foodItem.category,
        base_unit: foodItem.base_unit,
        nutritional_info: foodItem.nutritional_info
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating food item:', error);
      throw error;
    }

    return data;
  }
}
