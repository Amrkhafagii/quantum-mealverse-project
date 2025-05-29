
import { CartItem } from '@/contexts/CartContext';
import offlineStorage from '@/utils/offlineStorage';
import { STORAGE_KEYS } from '@/utils/offlineStorage/types';

export class CartValidationService {
  /**
   * Validates and cleans stored cart - now accepts all items without validation
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

      console.log('CartValidationService: Loaded cart items from storage:', storedCart.length);

      // Accept all items without validation - Phase 2 implementation
      return {
        validItems: storedCart,
        removedItems: [],
        errors: []
      };
    } catch (error) {
      console.error('CartValidationService: Error validating stored cart:', error);
      return {
        validItems: [],
        removedItems: [],
        errors: ['Failed to load cart from storage']
      };
    }
  }

  /**
   * Updates the stored cart
   */
  static async updateStoredCart(cartItems: CartItem[]): Promise<void> {
    try {
      await offlineStorage.set(STORAGE_KEYS.CART, cartItems);
      console.log('CartValidationService: Updated stored cart with', cartItems.length, 'items');
    } catch (error) {
      console.error('CartValidationService: Error updating stored cart:', error);
      throw error;
    }
  }

  /**
   * Clears the stored cart
   */
  static async clearStoredCart(): Promise<void> {
    try {
      await offlineStorage.remove(STORAGE_KEYS.CART);
      console.log('CartValidationService: Cleared stored cart');
    } catch (error) {
      console.error('CartValidationService: Error clearing stored cart:', error);
      throw error;
    }
  }

  /**
   * Validates individual cart item - now always returns valid
   */
  static async validateCartItem(item: CartItem): Promise<{
    isValid: boolean;
    updatedItem?: CartItem;
    error?: string;
  }> {
    // Phase 2: Accept all cart items without validation
    console.log('CartValidationService: Accepting cart item without validation:', item.name);
    return {
      isValid: true,
      updatedItem: item
    };
  }
}
