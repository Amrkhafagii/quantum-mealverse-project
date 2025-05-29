
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
  restaurant_id?: string; // Unified: all items can have restaurant assignment
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  dietary_tags?: string[];
  assignment_details?: RestaurantAssignmentDetail; // Unified: detailed assignment info
  estimated_prep_time?: number; // Unified: prep time for all items
  distance_km?: number; // Unified: distance info for all items
  assignment_source?: 'nutrition_generation' | 'traditional_ordering' | 'manual'; // Track source
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
  getRestaurantGroupings: () => { [restaurantId: string]: CartItem[] };
  hasRestaurantAssignments: () => boolean;
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
  getRestaurantGroupings: () => ({}),
  hasRestaurantAssignments: () => false,
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
      // No validation needed for adding items - just add them directly
      const unifiedItem: CartItem = {
        ...item,
        assignment_source: item.assignment_source || (item.restaurant_id ? 'nutrition_generation' : 'traditional_ordering')
      };

      setCart((prevCart) => {
        const existingItem = prevCart.find((cartItem) => cartItem.id === unifiedItem.id);
        if (existingItem) {
          return prevCart.map((cartItem) =>
            cartItem.id === unifiedItem.id
              ? { 
                  ...cartItem, 
                  quantity: cartItem.quantity + unifiedItem.quantity,
                  // Preserve restaurant assignment data
                  restaurant_id: cartItem.restaurant_id || unifiedItem.restaurant_id,
                  assignment_details: cartItem.assignment_details || unifiedItem.assignment_details,
                  estimated_prep_time: cartItem.estimated_prep_time || unifiedItem.estimated_prep_time,
                  distance_km: cartItem.distance_km || unifiedItem.distance_km
                }
              : cartItem
          );
        }
        return [...prevCart, unifiedItem];
      });

      const assignmentInfo = unifiedItem.restaurant_id 
        ? ` (assigned to restaurant)` 
        : ` (will be assigned to restaurant)`;

      toast({
        title: "Item added",
        description: `"${unifiedItem.name}" added to cart${assignmentInfo}`,
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

  // Unified helper: Group cart items by restaurant
  const getRestaurantGroupings = (): { [restaurantId: string]: CartItem[] } => {
    const groupings: { [restaurantId: string]: CartItem[] } = {};
    
    cart.forEach(item => {
      const restaurantId = item.restaurant_id || 'unassigned';
      if (!groupings[restaurantId]) {
        groupings[restaurantId] = [];
      }
      groupings[restaurantId].push(item);
    });
    
    return groupings;
  };

  // Unified helper: Check if cart has any restaurant assignments
  const hasRestaurantAssignments = (): boolean => {
    return cart.some(item => item.restaurant_id);
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
        validateCart,
        getRestaurantGroupings,
        hasRestaurantAssignments
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
