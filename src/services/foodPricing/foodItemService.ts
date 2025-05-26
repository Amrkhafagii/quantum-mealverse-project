
import { supabase } from '@/integrations/supabase/client';
import { FoodItem, FoodItemPrice, FoodPricingQuery, DynamicPricing } from '@/types/foodPricing';

export class FoodItemService {
  /**
   * Get all available food items from the food_items table
   */
  static async getAllFoodItems(): Promise<FoodItem[]> {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching food items:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        nutritional_info: typeof item.nutritional_info === 'string' 
          ? JSON.parse(item.nutritional_info) 
          : item.nutritional_info
      })) as FoodItem[];
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
        .from('food_items')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .order('name');

      if (error) {
        console.error('Error searching food items:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        nutritional_info: typeof item.nutritional_info === 'string' 
          ? JSON.parse(item.nutritional_info) 
          : item.nutritional_info
      })) as FoodItem[];
    } catch (error) {
      console.error('Error in searchFoodItems:', error);
      return [];
    }
  }

  /**
   * Get food items by category
   */
  static async getFoodItemsByCategory(category: string): Promise<FoodItem[]> {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) {
        console.error('Error fetching food items by category:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        nutritional_info: typeof item.nutritional_info === 'string' 
          ? JSON.parse(item.nutritional_info) 
          : item.nutritional_info
      })) as FoodItem[];
    } catch (error) {
      console.error('Error in getFoodItemsByCategory:', error);
      return [];
    }
  }

  /**
   * Get food item pricing with dynamic portion calculation
   */
  static async getFoodItemPricing(
    foodName: string,
    restaurantId?: string,
    portionSize: number = 100
  ): Promise<FoodPricingQuery[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_food_pricing', {
          p_food_name: foodName,
          p_restaurant_id: restaurantId || null,
          p_portion_size: portionSize
        });

      if (error) {
        console.error('Error fetching food pricing:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        food_item_id: item.food_item_id,
        food_name: item.food_name,
        restaurant_id: item.restaurant_id,
        restaurant_name: item.restaurant_name,
        base_price: item.base_price,
        calculated_price: item.calculated_price,
        portion_size: item.portion_size,
        base_unit: item.base_unit,
        nutritional_info: item.nutritional_info
      }));
    } catch (error) {
      console.error('Error in getFoodItemPricing:', error);
      return [];
    }
  }

  /**
   * Get cheapest price for a food item across all restaurants
   */
  static async getCheapestPrice(foodName: string, portionSize: number = 100): Promise<FoodPricingQuery | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_cheapest_food_pricing', {
          p_food_name: foodName,
          p_portion_size: portionSize
        });

      if (error) {
        console.error('Error fetching cheapest price:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const item = data[0];
        return {
          food_item_id: item.food_item_id,
          food_name: item.food_name,
          restaurant_id: item.restaurant_id,
          restaurant_name: item.restaurant_name,
          base_price: 0, // Not returned by this function
          calculated_price: item.calculated_price,
          portion_size: item.portion_size,
          base_unit: 'grams',
          nutritional_info: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Error in getCheapestPrice:', error);
      return null;
    }
  }

  /**
   * Calculate dynamic pricing for different portion sizes
   */
  static calculateDynamicPricing(
    basePrice: number,
    basePortion: number,
    requestedPortion: number
  ): DynamicPricing {
    const calculatedPrice = (basePrice * requestedPortion) / basePortion;
    const pricePerUnit = calculatedPrice / requestedPortion;

    return {
      base_price: basePrice,
      base_portion: basePortion,
      requested_portion: requestedPortion,
      calculated_price: Math.round(calculatedPrice * 100) / 100,
      price_per_unit: Math.round(pricePerUnit * 100) / 100
    };
  }

  /**
   * Get all active food item prices for a restaurant
   */
  static async getRestaurantFoodPrices(restaurantId: string): Promise<FoodItemPrice[]> {
    try {
      const { data, error } = await supabase
        .from('food_item_prices')
        .select(`
          *,
          food_items (
            name
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('price_per_base_portion');

      if (error) {
        console.error('Error fetching restaurant food prices:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRestaurantFoodPrices:', error);
      return [];
    }
  }

  /**
   * Update food item price for a restaurant
   */
  static async updateFoodItemPrice(
    foodItemId: string,
    restaurantId: string,
    pricePerBasePortion: number,
    basePortionSize: number = 100,
    minimumOrderQuantity?: number
  ): Promise<FoodItemPrice | null> {
    try {
      const { data, error } = await supabase
        .from('food_item_prices')
        .upsert({
          food_item_id: foodItemId,
          restaurant_id: restaurantId,
          price_per_base_portion: pricePerBasePortion,
          base_portion_size: basePortionSize,
          price_per_100g: pricePerBasePortion, // For backward compatibility
          food_name: '', // Will be populated by trigger or join
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
    } catch (error) {
      console.error('Error in updateFoodItemPrice:', error);
      return null;
    }
  }

  /**
   * Create a new food item
   */
  static async createFoodItem(foodItem: Omit<FoodItem, 'id' | 'created_at' | 'updated_at'>): Promise<FoodItem | null> {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .insert(foodItem)
        .select()
        .single();

      if (error) {
        console.error('Error creating food item:', error);
        throw error;
      }

      return {
        ...data,
        nutritional_info: typeof data.nutritional_info === 'string' 
          ? JSON.parse(data.nutritional_info) 
          : data.nutritional_info
      } as FoodItem;
    } catch (error) {
      console.error('Error in createFoodItem:', error);
      return null;
    }
  }

  /**
   * Get food item by ID
   */
  static async getFoodItemById(id: string): Promise<FoodItem | null> {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching food item by ID:', error);
        throw error;
      }

      return {
        ...data,
        nutritional_info: typeof data.nutritional_info === 'string' 
          ? JSON.parse(data.nutritional_info) 
          : data.nutritional_info
      } as FoodItem;
    } catch (error) {
      console.error('Error in getFoodItemById:', error);
      return null;
    }
  }
}
