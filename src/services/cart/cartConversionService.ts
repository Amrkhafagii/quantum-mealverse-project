
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';
import { NutritionCartItem } from '@/contexts/NutritionCartContext';

export class CartConversionService {
  /**
   * Converts nutrition cart items to restaurant cart items
   */
  static async convertNutritionToRestaurant(
    nutritionItems: NutritionCartItem[]
  ): Promise<{
    converted: CartItem[];
    notFound: NutritionCartItem[];
    suggestions: Array<{ nutritionItem: NutritionCartItem; menuItems: any[] }>;
  }> {
    try {
      // Get all available menu items
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true);

      if (menuError) throw menuError;

      // Get existing mappings
      const { data: mappings, error: mappingError } = await supabase
        .from('meal_plan_to_menu_mappings')
        .select(`
          nutrition_food_name,
          menu_item_id,
          similarity_score,
          nutritional_accuracy,
          menu_items (*)
        `)
        .in('nutrition_food_name', nutritionItems.map(item => item.name));

      if (mappingError) throw mappingError;

      const converted: CartItem[] = [];
      const notFound: NutritionCartItem[] = [];
      const suggestions: Array<{ nutritionItem: NutritionCartItem; menuItems: any[] }> = [];

      for (const nutritionItem of nutritionItems) {
        const mapping = mappings?.find(m => m.nutrition_food_name === nutritionItem.name);
        
        if (mapping && mapping.menu_items) {
          const menuItem = mapping.menu_items;
          const nutritionalInfo = menuItem.nutritional_info as any;
          
          // Direct mapping found
          converted.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: nutritionItem.quantity,
            description: menuItem.description,
            calories: nutritionalInfo?.calories || 0,
            protein: nutritionalInfo?.protein || 0,
            carbs: nutritionalInfo?.carbs || 0,
            fat: nutritionalInfo?.fat || 0,
            image_url: menuItem.image_url,
            restaurant_id: menuItem.restaurant_id,
          });
        } else {
          // No direct mapping, find suggestions based on nutritional similarity
          const similarItems = this.findSimilarMenuItems(nutritionItem, menuItems || []);
          
          if (similarItems.length > 0) {
            suggestions.push({
              nutritionItem,
              menuItems: similarItems.slice(0, 3) // Top 3 suggestions
            });
          } else {
            notFound.push(nutritionItem);
          }
        }
      }

      return { converted, notFound, suggestions };
    } catch (error) {
      console.error('Error converting nutrition cart:', error);
      throw error;
    }
  }

  /**
   * Find menu items similar to a nutrition item based on nutritional content
   */
  private static findSimilarMenuItems(nutritionItem: NutritionCartItem, menuItems: any[]) {
    return menuItems
      .map(menuItem => {
        const nutritionalInfo = menuItem.nutritional_info as any;
        
        const menuCalories = nutritionalInfo?.calories || 0;
        const menuProtein = nutritionalInfo?.protein || 0;
        const menuCarbs = nutritionalInfo?.carbs || 0;
        const menuFat = nutritionalInfo?.fat || 0;
        
        const caloriesDiff = Math.abs(menuCalories - nutritionItem.calories);
        const proteinDiff = Math.abs(menuProtein - nutritionItem.protein);
        const carbsDiff = Math.abs(menuCarbs - nutritionItem.carbs);
        const fatDiff = Math.abs(menuFat - nutritionItem.fat);
        
        // Calculate similarity score (lower is better)
        const totalDiff = caloriesDiff + proteinDiff + carbsDiff + fatDiff;
        const similarity = 1 / (1 + totalDiff / 100); // Normalize to 0-1
        
        return {
          ...menuItem,
          similarity_score: similarity
        };
      })
      .filter(item => item.similarity_score > 0.3) // Only items with reasonable similarity
      .sort((a, b) => b.similarity_score - a.similarity_score);
  }

  /**
   * Creates a mapping between nutrition food and menu item
   */
  static async createMapping(
    nutritionFoodName: string,
    menuItemId: string,
    similarityScore: number = 1.0,
    nutritionalAccuracy: number = 1.0
  ) {
    try {
      const { error } = await supabase
        .from('meal_plan_to_menu_mappings')
        .insert({
          nutrition_food_name: nutritionFoodName,
          menu_item_id: menuItemId,
          similarity_score: similarityScore,
          nutritional_accuracy: nutritionalAccuracy
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating mapping:', error);
      throw error;
    }
  }

  /**
   * Transfers items from restaurant cart to nutrition cart
   */
  static async convertRestaurantToNutrition(
    restaurantItems: CartItem[],
    userId?: string
  ): Promise<NutritionCartItem[]> {
    const nutritionItems: Omit<NutritionCartItem, 'id'>[] = restaurantItems.map(item => ({
      name: item.name,
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      quantity: item.quantity,
      portion_size: 100, // Default portion size
      meal_type: 'lunch' as const, // Default meal type
      food_category: 'restaurant_item'
    }));

    // Insert into nutrition cart
    const sessionId = !userId ? localStorage.getItem('nutrition-session-id') || crypto.randomUUID() : null;
    
    const insertData = nutritionItems.map(item => ({
      ...item,
      user_id: userId || null,
      session_id: sessionId
    }));

    const { data, error } = await supabase
      .from('nutrition_cart_items')
      .insert(insertData)
      .select();

    if (error) throw error;
    
    // Transform returned data to match our interface
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      calories: Number(item.calories),
      protein: Number(item.protein),
      carbs: Number(item.carbs),
      fat: Number(item.fat),
      quantity: item.quantity,
      portion_size: Number(item.portion_size),
      food_category: item.food_category,
      meal_type: item.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      usda_food_id: item.usda_food_id,
    }));
  }
}
