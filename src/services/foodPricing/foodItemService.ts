
import { supabase } from '@/integrations/supabase/client';
import { FoodItem, FoodItemPrice, FoodPricingQuery } from '@/types/foodPricing';

export class FoodItemService {
  /**
   * Get all available food items - using existing table structure
   */
  static async getAllFoodItems(): Promise<FoodItem[]> {
    try {
      // Since food_items table may not be in types yet, we'll use the existing food_item_prices table
      // and work with what's available
      const { data, error } = await supabase
        .from('food_item_prices')
        .select('*')
        .order('food_name');

      if (error) {
        console.error('Error fetching food items:', error);
        throw error;
      }

      // Convert to FoodItem format
      const uniqueFoods = new Map();
      (data || []).forEach((item: any) => {
        if (!uniqueFoods.has(item.food_name)) {
          uniqueFoods.set(item.food_name, {
            id: item.food_name, // Use name as ID for now
            name: item.food_name,
            category: 'general',
            base_unit: 'grams',
            nutritional_info: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0
            },
            created_at: item.created_at,
            updated_at: item.updated_at
          });
        }
      });

      return Array.from(uniqueFoods.values());
    } catch (error) {
      console.error('Error in getAllFoodItems:', error);
      return [];
    }
  }

  /**
   * Search food items by name
   */
  static async searchFoodItems(searchTerm: string): Promise<FoodItem[]> {
    try {
      const { data, error } = await supabase
        .from('food_item_prices')
        .select('*')
        .ilike('food_name', `%${searchTerm}%`)
        .order('food_name');

      if (error) {
        console.error('Error searching food items:', error);
        throw error;
      }

      // Convert to FoodItem format
      const uniqueFoods = new Map();
      (data || []).forEach((item: any) => {
        if (!uniqueFoods.has(item.food_name)) {
          uniqueFoods.set(item.food_name, {
            id: item.food_name,
            name: item.food_name,
            category: 'general',
            base_unit: 'grams',
            nutritional_info: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0
            },
            created_at: item.created_at,
            updated_at: item.updated_at
          });
        }
      });

      return Array.from(uniqueFoods.values());
    } catch (error) {
      console.error('Error in searchFoodItems:', error);
      return [];
    }
  }

  /**
   * Get food items by category
   */
  static async getFoodItemsByCategory(category: string): Promise<FoodItem[]> {
    // For now, return all items since we don't have category filtering
    return this.getAllFoodItems();
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
      let query = supabase
        .from('food_item_prices')
        .select(`
          *,
          restaurants(name)
        `)
        .ilike('food_name', `%${foodName}%`)
        .eq('is_active', true);

      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query.order('price_per_100g', { ascending: true });

      if (error) {
        console.error('Error fetching food pricing:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        food_item_id: item.id,
        food_name: item.food_name,
        restaurant_id: item.restaurant_id,
        restaurant_name: item.restaurants?.name || 'Unknown',
        price_per_unit: item.price_per_100g / 100, // Convert from per 100g to per gram
        total_price: (item.price_per_100g / 100) * quantity,
        base_unit: 'grams',
        nutritional_info: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
      }));
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
    try {
      const { data, error } = await supabase
        .from('food_item_prices')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('price_per_100g');

      if (error) {
        console.error('Error fetching restaurant food prices:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        food_item_id: item.food_name, // Use food_name as food_item_id
        restaurant_id: item.restaurant_id,
        price_per_unit: item.price_per_100g / 100, // Convert to per gram
        minimum_order_quantity: 1,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error in getRestaurantFoodPrices:', error);
      return [];
    }
  }

  /**
   * Update food item price for a restaurant
   */
  static async updateFoodItemPrice(
    foodName: string,
    restaurantId: string,
    pricePerUnit: number,
    minimumOrderQuantity?: number
  ): Promise<FoodItemPrice | null> {
    try {
      const pricesPer100g = pricePerUnit * 100; // Convert from per gram to per 100g

      const { data, error } = await supabase
        .from('food_item_prices')
        .upsert({
          food_name: foodName,
          restaurant_id: restaurantId,
          price_per_100g: pricesPer100g,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating food item price:', error);
        throw error;
      }

      if (data) {
        return {
          id: data.id,
          food_item_id: data.food_name,
          restaurant_id: data.restaurant_id,
          price_per_unit: data.price_per_100g / 100,
          minimum_order_quantity: minimumOrderQuantity || 1,
          is_active: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
      }

      return null;
    } catch (error) {
      console.error('Error in updateFoodItemPrice:', error);
      return null;
    }
  }

  /**
   * Create a new food item - simplified version
   */
  static async createFoodItem(foodItem: Omit<FoodItem, 'id' | 'created_at' | 'updated_at'>): Promise<FoodItem | null> {
    try {
      // For now, we'll just return the food item as-is since we don't have a separate food_items table
      // In a real implementation, this would create the food item first
      return {
        id: foodItem.name,
        ...foodItem,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in createFoodItem:', error);
      return null;
    }
  }
}
