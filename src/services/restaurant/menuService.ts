
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, MenuCategory } from '@/types/menu';
import { Database } from '@/integrations/supabase/types';

type MenuItemRow = Database['public']['Tables']['menu_items']['Row'];
type MenuCategoryRow = Database['public']['Tables']['menu_categories']['Row'];

/**
 * Get menu items for a restaurant
 */
export const getMenuItems = async (
  restaurantId: string,
  category?: string,
  isAvailableOnly = false
): Promise<MenuItem[]> => {
  try {
    let query = supabase
      .from('menu_items')
      .select()
      .eq('restaurant_id', restaurantId);
      
    if (category) {
      query = query.eq('category', category);
    }
    
    if (isAvailableOnly) {
      query = query.eq('is_available', true);
    }
    
    const { data, error } = await query.order('category');
    
    if (error) throw error;
    return (data || []) as MenuItem[];
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
};

/**
 * Create or update a menu item
 */
export const saveMenuItem = async (item: MenuItem): Promise<MenuItem | null> => {
  try {
    if (item.id) {
      // Update existing item
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image_url: item.image_url,
          nutritional_info: item.nutritional_info,
          is_available: item.is_available,
          preparation_time: item.preparation_time,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
        .eq('restaurant_id', item.restaurant_id)
        .select()
        .single();
        
      if (error) throw error;
      return data as MenuItem;
    } else {
      // Create new item
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          restaurant_id: item.restaurant_id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image_url: item.image_url,
          nutritional_info: item.nutritional_info,
          is_available: item.is_available,
          preparation_time: item.preparation_time
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as MenuItem;
    }
  } catch (error) {
    console.error('Error saving menu item:', error);
    return null;
  }
};

/**
 * Delete a menu item
 */
export const deleteMenuItem = async (itemId: string, restaurantId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId)
      .eq('restaurant_id', restaurantId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }
};

/**
 * Get menu categories for a restaurant
 */
export const getMenuCategories = async (restaurantId: string): Promise<MenuCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('menu_categories')
      .select()
      .eq('restaurant_id', restaurantId)
      .order('order');
      
    if (error) throw error;
    return (data as MenuCategory[]) || [];
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    return [];
  }
};
