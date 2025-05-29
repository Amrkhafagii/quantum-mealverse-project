
import { CartItem } from '@/contexts/CartContext';
import offlineStorage from '@/utils/offlineStorage';
import { STORAGE_KEYS } from '@/utils/offlineStorage/types';

export class CartValidationService {
  /**
   * Phase 6: Integrated cart validation - accepts all items without restrictions
   */
  static async validateAndCleanStoredCart(): Promise<{
    validItems: CartItem[];
    removedItems: CartItem[];
    errors: string[];
  }> {
    try {
      const storedCart = await offlineStorage.get<CartItem[]>(STORAGE_KEYS.CART);
      
      if (!storedCart || !Array.isArray(storedCart)) {
        return {
          validItems: [],
          removedItems: [],
          errors: []
        };
      }

      console.log('Phase 6: Integrated cart validation - accepting all items:', storedCart.length);

      // Phase 6: Accept all items without any validation barriers
      return {
        validItems: storedCart,
        removedItems: [],
        errors: []
      };
    } catch (error) {
      console.error('Phase 6: Error in integrated cart validation:', error);
      return {
        validItems: [],
        removedItems: [],
        errors: ['Failed to load cart from storage']
      };
    }
  }

  /**
   * Phase 6: Updates the stored cart with integrated support
   */
  static async updateStoredCart(cartItems: CartItem[]): Promise<void> {
    try {
      await offlineStorage.set(STORAGE_KEYS.CART, cartItems);
      console.log('Phase 6: Updated stored cart with integrated support:', cartItems.length, 'items');
    } catch (error) {
      console.error('Phase 6: Error updating integrated cart:', error);
      throw error;
    }
  }

  /**
   * Phase 6: Clears the stored cart
   */
  static async clearStoredCart(): Promise<void> {
    try {
      await offlineStorage.remove(STORAGE_KEYS.CART);
      console.log('Phase 6: Cleared integrated cart storage');
    } catch (error) {
      console.error('Phase 6: Error clearing integrated cart:', error);
      throw error;
    }
  }

  /**
   * Phase 6: Validates individual cart item - integrated approach accepts all
   */
  static async validateCartItem(item: CartItem): Promise<{
    isValid: boolean;
    updatedItem?: CartItem;
    error?: string;
  }> {
    console.log('Phase 6: Integrated cart item validation - accepting:', item.name);
    
    // Phase 6: Integrated validation accepts all items
    return {
      isValid: true,
      updatedItem: item
    };
  }
}
