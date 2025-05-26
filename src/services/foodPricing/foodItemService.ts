
import { supabase } from '@/integrations/supabase/client';
import { FoodItem, FoodItemPrice, FoodPricingQuery } from '@/types/foodPricing';

export class FoodItemService {
  /**
   * Get all available food items using raw SQL since the table isn't in types yet
   */
  static async getAllFoodItems(): Promise<FoodItem[]> {
    try {
      const { data, error } = await supabase
        .rpc('execute_sql', { 
          sql: 'SELECT * FROM food_items ORDER BY name' 
        });

      if (error) {
        console.error('Error fetching food items:', error);
        throw error;
      }

      return (data as any[])?.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        base_unit: item.base_unit,
        nutritional_info: item.nutritional_info,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
    } catch (error) {
      console.error('Error in getAllFoodItems:', error);
      return [];
    }
  }

  /**
   * Search food items by name using raw SQL
   */
  static async searchFoodItems(searchTerm: string): Promise<FoodItem[]> {
    try {
      const { data, error } = await supabase
        .rpc('execute_sql', { 
          sql: `SELECT * FROM food_items WHERE name ILIKE '%${searchTerm}%' ORDER BY name` 
        });

      if (error) {
        console.error('Error searching food items:', error);
        throw error;
      }

      return (data as any[])?.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        base_unit: item.base_unit,
        nutritional_info: item.nutritional_info,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
    } catch (error) {
      console.error('Error in searchFoodItems:', error);
      return [];
    }
  }

  /**
   * Get food items by category using raw SQL
   */
  static async getFoodItemsByCategory(category: string): Promise<FoodItem[]> {
    try {
      const { data, error } = await supabase
        .rpc('execute_sql', { 
          sql: `SELECT * FROM food_items WHERE category = '${category}' ORDER BY name` 
        });

      if (error) {
        console.error('Error fetching food items by category:', error);
        throw error;
      }

      return (data as any[])?.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        base_unit: item.base_unit,
        nutritional_info: item.nutritional_info,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
    } catch (error) {
      console.error('Error in getFoodItemsByCategory:', error);
      return [];
    }
  }

  /**
   * Get food item pricing for a specific food and restaurant using raw SQL
   */
  static async getFoodItemPricing(
    foodName: string,
    restaurantId?: string,
    quantity: number = 100
  ): Promise<FoodPricingQuery[]> {
    try {
      let sql = `
        SELECT 
          fi.id as food_item_id,
          fi.name as food_name,
          fip.restaurant_id,
          r.name as restaurant_name,
          fip.price_per_unit,
          (fip.price_per_unit * ${quantity}) as total_price,
          fi.base_unit,
          fi.nutritional_info
        FROM food_items fi
        JOIN food_item_prices fip ON fi.id = fip.food_item_id
        JOIN restaurants r ON fip.restaurant_id = r.id
        WHERE fi.name ILIKE '%${foodName}%'
          AND fip.is_active = true
      `;

      if (restaurantId) {
        sql += ` AND fip.restaurant_id = '${restaurantId}'`;
      }

      sql += ' ORDER BY fip.price_per_unit ASC';

      const { data, error } = await supabase.rpc('execute_sql', { sql });

      if (error) {
        console.error('Error fetching food pricing:', error);
        throw error;
      }

      return (data as any[])?.map(item => ({
        food_item_id: item.food_item_id,
        food_name: item.food_name,
        restaurant_id: item.restaurant_id,
        restaurant_name: item.restaurant_name,
        price_per_unit: parseFloat(item.price_per_unit),
        total_price: parseFloat(item.total_price),
        base_unit: item.base_unit,
        nutritional_info: item.nutritional_info
      })) || [];
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
   * Get all active food item prices for a restaurant using raw SQL
   */
  static async getRestaurantFoodPrices(restaurantId: string): Promise<FoodItemPrice[]> {
    try {
      const { data, error } = await supabase
        .rpc('execute_sql', { 
          sql: `
            SELECT * FROM food_item_prices 
            WHERE restaurant_id = '${restaurantId}' 
            AND is_active = true 
            ORDER BY price_per_unit
          ` 
        });

      if (error) {
        console.error('Error fetching restaurant food prices:', error);
        throw error;
      }

      return (data as any[])?.map(item => ({
        id: item.id,
        food_item_id: item.food_item_id,
        restaurant_id: item.restaurant_id,
        price_per_unit: parseFloat(item.price_per_unit),
        minimum_order_quantity: item.minimum_order_quantity,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
    } catch (error) {
      console.error('Error in getRestaurantFoodPrices:', error);
      return [];
    }
  }

  /**
   * Update food item price for a restaurant using raw SQL
   */
  static async updateFoodItemPrice(
    foodItemId: string,
    restaurantId: string,
    pricePerUnit: number,
    minimumOrderQuantity?: number
  ): Promise<FoodItemPrice | null> {
    try {
      const { data, error } = await supabase
        .rpc('execute_sql', { 
          sql: `
            INSERT INTO food_item_prices (food_item_id, restaurant_id, price_per_unit, minimum_order_quantity, is_active, updated_at)
            VALUES ('${foodItemId}', '${restaurantId}', ${pricePerUnit}, ${minimumOrderQuantity || 1}, true, NOW())
            ON CONFLICT (food_item_id, restaurant_id) 
            DO UPDATE SET 
              price_per_unit = ${pricePerUnit},
              minimum_order_quantity = ${minimumOrderQuantity || 1},
              is_active = true,
              updated_at = NOW()
            RETURNING *
          ` 
        });

      if (error) {
        console.error('Error updating food item price:', error);
        throw error;
      }

      const result = data as any[];
      if (result && result.length > 0) {
        const item = result[0];
        return {
          id: item.id,
          food_item_id: item.food_item_id,
          restaurant_id: item.restaurant_id,
          price_per_unit: parseFloat(item.price_per_unit),
          minimum_order_quantity: item.minimum_order_quantity,
          is_active: item.is_active,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      }

      return null;
    } catch (error) {
      console.error('Error in updateFoodItemPrice:', error);
      return null;
    }
  }

  /**
   * Create a new food item using raw SQL
   */
  static async createFoodItem(foodItem: Omit<FoodItem, 'id' | 'created_at' | 'updated_at'>): Promise<FoodItem | null> {
    try {
      const { data, error } = await supabase
        .rpc('execute_sql', { 
          sql: `
            INSERT INTO food_items (name, category, base_unit, nutritional_info)
            VALUES ('${foodItem.name}', '${foodItem.category}', '${foodItem.base_unit}', '${JSON.stringify(foodItem.nutritional_info)}')
            RETURNING *
          ` 
        });

      if (error) {
        console.error('Error creating food item:', error);
        throw error;
      }

      const result = data as any[];
      if (result && result.length > 0) {
        const item = result[0];
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          base_unit: item.base_unit,
          nutritional_info: item.nutritional_info,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      }

      return null;
    } catch (error) {
      console.error('Error in createFoodItem:', error);
      return null;
    }
  }
}
