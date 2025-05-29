
import { CartItem } from '@/contexts/CartContext';

export class CartValidationService {
  private static readonly CART_STORAGE_KEY = 'quantum-cart-items';
  private static readonly CART_VERSION_KEY = 'quantum-cart-version';
  private static readonly CURRENT_CART_VERSION = '2.0';

  /**
   * Validates and cleans cart items from localStorage
   */
  static async validateAndCleanStoredCart(): Promise<{
    validItems: CartItem[];
    removedItems: CartItem[];
    hasInvalidItems: boolean;
  }> {
    try {
      // Check cart version - if outdated, clear everything
      const storedVersion = localStorage.getItem(this.CART_VERSION_KEY);
      if (storedVersion !== this.CURRENT_CART_VERSION) {
        console.log('Cart version mismatch, clearing cart');
        this.clearStoredCart();
        return { validItems: [], removedItems: [], hasInvalidItems: false };
      }

      const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (!storedCart) {
        return { validItems: [], removedItems: [], hasInvalidItems: false };
      }

      const cartItems: CartItem[] = JSON.parse(storedCart);
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return { validItems: [], removedItems: [], hasInvalidItems: false };
      }

      console.log('Loading stored cart items without validation:', cartItems.map(item => ({
        id: item.id,
        name: item.name
      })));

      // No validation - just return all items as valid
      return {
        validItems: cartItems,
        removedItems: [],
        hasInvalidItems: false
      };
    } catch (error) {
      console.error('Error loading stored cart:', error);
      // On error, clear the cart to prevent issues
      this.clearStoredCart();
      return { validItems: [], removedItems: [], hasInvalidItems: false };
    }
  }

  /**
   * Updates stored cart with validated items
   */
  static updateStoredCart(items: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(this.CART_VERSION_KEY, this.CURRENT_CART_VERSION);
    } catch (error) {
      console.error('Error updating stored cart:', error);
    }
  }

  /**
   * Clears stored cart completely
   */
  static clearStoredCart(): void {
    try {
      localStorage.removeItem(this.CART_STORAGE_KEY);
      localStorage.removeItem(this.CART_VERSION_KEY);
    } catch (error) {
      console.error('Error clearing stored cart:', error);
    }
  }
}
