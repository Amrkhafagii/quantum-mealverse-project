
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, MenuCategory, NutritionalInfo } from '@/types/menu';
import { Database } from '@/integrations/supabase/types';
import { Json } from '@/types/database';

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
    console.log(`Fetching menu items for restaurant: ${restaurantId}, category: ${category || 'all'}, availableOnly: ${isAvailableOnly}`);
    
    let query = supabase
      .from('menu_items')
      .select();
      
    // Debug: Get all menu items first to verify data exists
    const { data: allData, error: allError } = await query;
    console.log(`Total menu items in database: ${allData?.length || 0}`);
    
    if (allError) {
      console.error('Error fetching all menu items:', allError);
    }
    
    // Apply filters
    query = supabase
      .from('menu_items')
      .select();
      
    // Check restaurant ID format
    console.log(`Restaurant ID type: ${typeof restaurantId}, value: ${restaurantId}`);
    
    query = query.eq('restaurant_id', restaurantId);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (isAvailableOnly) {
      query = query.eq('is_available', true);
    }
    
    const { data, error } = await query.order('category');
    
    if (error) {
      console.error('Error fetching menu items with filters:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} menu items for restaurant ${restaurantId}`);
    
    // Transform the nutritional_info from Json to NutritionalInfo
    return (data || []).map(item => {
      console.log(`Menu item: ${item.name}, restaurant_id: ${item.restaurant_id}`);
      return {
        ...item,
        nutritional_info: item.nutritional_info as unknown as NutritionalInfo
      };
    }) as MenuItem[];
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
          nutritional_info: item.nutritional_info as unknown as Json,
          is_available: item.is_available,
          preparation_time: item.preparation_time,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
        .eq('restaurant_id', item.restaurant_id)
        .select()
        .single();
        
      if (error) throw error;
      return {
        ...data,
        nutritional_info: data.nutritional_info as unknown as NutritionalInfo
      } as MenuItem;
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
          nutritional_info: item.nutritional_info as unknown as Json,
          is_available: item.is_available,
          preparation_time: item.preparation_time
        })
        .select()
        .single();
        
      if (error) throw error;
      return {
        ...data,
        nutritional_info: data.nutritional_info as unknown as NutritionalInfo
      } as MenuItem;
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

/**
 * Create or update a menu category
 */
export const saveMenuCategory = async (category: MenuCategory): Promise<MenuCategory | null> => {
  try {
    if (category.id) {
      // Update existing category
      const { data, error } = await supabase
        .from('menu_categories')
        .update({
          name: category.name,
          description: category.description,
          order: category.order,
          restaurant_id: category.restaurant_id
        })
        .eq('id', category.id)
        .eq('restaurant_id', category.restaurant_id)
        .select()
        .single();
        
      if (error) throw error;
      return data as MenuCategory;
    } else {
      // Create new category
      const { data, error } = await supabase
        .from('menu_categories')
        .insert({
          name: category.name,
          description: category.description,
          order: category.order,
          restaurant_id: category.restaurant_id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as MenuCategory;
    }
  } catch (error) {
    console.error('Error saving menu category:', error);
    return null;
  }
};

/**
 * Delete a menu category
 */
export const deleteMenuCategory = async (categoryId: string, restaurantId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', categoryId)
      .eq('restaurant_id', restaurantId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting menu category:', error);
    return false;
  }
};
