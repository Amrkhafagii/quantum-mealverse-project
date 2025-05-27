
import { supabase } from '@/integrations/supabase/client';

export interface RestaurantMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  is_available: boolean;
  preparation_time: number;
  ingredients?: string[];
  nutritional_info?: any;
  created_at: string;
  updated_at: string;
}

export const restaurantMenuService = {
  async getMenuItems(restaurantId: string): Promise<RestaurantMenuItem[]> {
    const { data, error } = await supabase
      .from('restaurant_menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createMenuItem(restaurantId: string, menuItem: Omit<RestaurantMenuItem, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>): Promise<RestaurantMenuItem> {
    const { data, error } = await supabase
      .from('restaurant_menu_items')
      .insert({
        restaurant_id: restaurantId,
        ...menuItem
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMenuItem(itemId: string, updates: Partial<RestaurantMenuItem>): Promise<RestaurantMenuItem> {
    const { data, error } = await supabase
      .from('restaurant_menu_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMenuItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('restaurant_menu_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  async getMenuItemsByCategory(restaurantId: string): Promise<Record<string, RestaurantMenuItem[]>> {
    const items = await this.getMenuItems(restaurantId);
    return items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, RestaurantMenuItem[]>);
  }
};
