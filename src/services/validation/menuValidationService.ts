
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';

export class MenuValidationService {
  /**
   * Validates that a menu item exists and is available
   */
  static async validateMenuItem(itemId: string): Promise<{ isValid: boolean; item?: any }> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', itemId)
        .eq('is_available', true)
        .single();

      if (error || !data) {
        return { isValid: false };
      }

      return { isValid: true, item: data };
    } catch (error) {
      console.error('Error validating menu item:', error);
      return { isValid: false };
    }
  }

  /**
   * Validates multiple menu items at once
   */
  static async validateMenuItems(itemIds: string[]): Promise<{
    validItems: string[];
    invalidItems: string[];
    menuItems: Record<string, any>;
  }> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .in('id', itemIds)
        .eq('is_available', true);

      if (error) throw error;

      const validItems: string[] = [];
      const menuItems: Record<string, any> = {};
      
      (data || []).forEach(item => {
        validItems.push(item.id);
        menuItems[item.id] = item;
      });

      const invalidItems = itemIds.filter(id => !validItems.includes(id));

      return { validItems, invalidItems, menuItems };
    } catch (error) {
      console.error('Error validating menu items:', error);
      return {
        validItems: [],
        invalidItems: itemIds,
        menuItems: {}
      };
    }
  }

  /**
   * Validates cart items against menu items table
   */
  static async validateCartItems(cartItems: CartItem[]): Promise<{
    validItems: CartItem[];
    invalidItems: CartItem[];
    errors: string[];
  }> {
    const itemIds = cartItems.map(item => item.id);
    const { validItems: validIds, invalidItems: invalidIds, menuItems } = 
      await this.validateMenuItems(itemIds);

    const validItems = cartItems.filter(item => validIds.includes(item.id));
    const invalidItems = cartItems.filter(item => invalidIds.includes(item.id));
    
    const errors = invalidItems.map(item => 
      `Item "${item.name}" is no longer available or does not exist in our menu`
    );

    // Update valid items with fresh menu data
    const updatedValidItems = validItems.map(cartItem => {
      const menuItem = menuItems[cartItem.id];
      if (menuItem) {
        return {
          ...cartItem,
          name: menuItem.name,
          price: menuItem.price,
          description: menuItem.description
        };
      }
      return cartItem;
    });

    return {
      validItems: updatedValidItems,
      invalidItems,
      errors
    };
  }

  /**
   * Checks if menu_items table has any data
   */
  static async hasMenuData(): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return (count || 0) > 0;
    } catch (error) {
      console.error('Error checking menu data:', error);
      return false;
    }
  }
}
