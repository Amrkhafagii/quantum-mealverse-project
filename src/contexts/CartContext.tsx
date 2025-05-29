
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RestaurantAssignmentDetail } from '@/types/restaurantAssignment';
import { CartValidationService } from '@/services/cart/cartValidationService';
import { useToast } from '@/hooks/use-toast';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  is_active?: boolean;
  restaurant_id?: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  dietary_tags?: string[];
  assignment_details?: RestaurantAssignmentDetail;
  estimated_prep_time?: number;
  distance_km?: number;
};

export type CartContextType = {
  cart: CartItem[];
  items: CartItem[];
  totalAmount: number;
  addToCart: (item: CartItem) => Promise<boolean>;
  addItem: (item: CartItem) => Promise<boolean>;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  validateCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType>({
  cart: [],
  items: [],
  totalAmount: 0,
  addToCart: async () => false,
  addItem: async () => false,
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  validateCart: async () => {},
});

export const useCart = () => useContext(CartContext);

type CartProviderProps = {
  children: ReactNode;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Calculate total amount from cart items
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Initialize cart from localStorage with validation
  useEffect(() => {
    initializeCart();
  }, []);

  // Save cart to localStorage whenever it changes (after initialization)
  useEffect(() => {
    if (isInitialized) {
      CartValidationService.updateStoredCart(cart);
    }
  }, [cart, isInitialized]);

  const initializeCart = async () => {
    try {
      const validation = await CartValidationService.validateAndCleanStoredCart();
      
      setCart(validation.validItems);
      
      // Notify user about removed items
      if (validation.hasInvalidItems) {
        const removedItemNames = validation.removedItems.map(item => item.name).join(', ');
        toast({
          title: "Cart updated",
          description: `Removed unavailable items: ${removedItemNames}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error initializing cart:', error);
      setCart([]);
    } finally {
      setIsInitialized(true);
    }
  };

  const addToCart = async (item: CartItem): Promise<boolean> => {
    try {
      // Validate the item before adding
      const validation = await CartValidationService.validateItemForCart(item);
      
      if (!validation.isValid) {
        toast({
          title: "Item not available",
          description: validation.error || "Item is no longer available",
          variant: "destructive"
        });
        return false;
      }

      const itemToAdd = validation.updatedItem || item;

      setCart((prevCart) => {
        const existingItem = prevCart.find((cartItem) => cartItem.id === itemToAdd.id);
        if (existingItem) {
          return prevCart.map((cartItem) =>
            cartItem.id === itemToAdd.id
              ? { ...cartItem, quantity: cartItem.quantity + itemToAdd.quantity }
              : cartItem
          );
        }
        return [...prevCart, itemToAdd];
      });

      toast({
        title: "Item added",
        description: `"${itemToAdd.name}" added to cart`,
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast({
        title: "Error adding item",
        description: "Unable to add item to cart. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Alias for addToCart for better readability
  const addItem = addToCart;

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    CartValidationService.clearStoredCart();
  };

  const validateCart = async () => {
    try {
      if (cart.length === 0) return;

      const validation = await CartValidationService.validateAndCleanStoredCart();
      
      if (validation.hasInvalidItems) {
        setCart(validation.validItems);
        
        const removedItemNames = validation.removedItems.map(item => item.name).join(', ');
        toast({
          title: "Cart updated",
          description: `Removed unavailable items: ${removedItemNames}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error validating cart:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        items: cart, // alias for items for compatibility
        totalAmount,
        addToCart, 
        addItem, // add the alias
        removeFromCart, 
        updateQuantity, 
        clearCart,
        validateCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
