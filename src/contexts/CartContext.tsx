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

  // Initialize cart from localStorage
  useEffect(() => {
    initializeCart();
  }, []);

  // Save cart to localStorage whenever it changes (after initialization)
  useEffect(() => {
    if (isInitialized) {
      console.log("CartContext: Saving cart to localStorage:", cart);
      CartValidationService.updateStoredCart(cart);
    }
  }, [cart, isInitialized]);

  const initializeCart = async () => {
    try {
      console.log("CartContext: Initializing cart from localStorage");
      const validation = await CartValidationService.validateAndCleanStoredCart();
      
      console.log("CartContext: Loaded cart items:", validation.validItems);
      setCart(validation.validItems);
      
      // No longer show notifications for removed items - just accept everything
    } catch (error) {
      console.error('CartContext: Error initializing cart:', error);
      setCart([]);
    } finally {
      setIsInitialized(true);
      console.log("CartContext: Cart initialization complete");
    }
  };

  const addToCart = async (item: CartItem): Promise<boolean> => {
    try {
      console.log("CartContext: Adding item to cart:", item);
      
      // No validation needed - just add items directly
      const unifiedItem: CartItem = {
        ...item,
        assignment_source: item.assignment_source || (item.restaurant_id ? 'nutrition_generation' : 'traditional_ordering')
      };

      console.log("CartContext: Unified item:", unifiedItem);

      setCart((prevCart) => {
        console.log("CartContext: Previous cart:", prevCart);
        const existingItem = prevCart.find((cartItem) => cartItem.id === unifiedItem.id);
        
        if (existingItem) {
          console.log("CartContext: Item exists, updating quantity");
          const updatedCart = prevCart.map((cartItem) =>
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
          console.log("CartContext: Updated cart with existing item:", updatedCart);
          return updatedCart;
        }
        
        console.log("CartContext: Adding new item to cart");
        const newCart = [...prevCart, unifiedItem];
        console.log("CartContext: New cart:", newCart);
        return newCart;
      });

      const assignmentInfo = unifiedItem.restaurant_id 
        ? ` (assigned to restaurant)` 
        : ` (will be assigned to restaurant)`;

      toast({
        title: "Item added",
        description: `"${unifiedItem.name}" added to cart${assignmentInfo}`,
        variant: "default"
      });

      console.log("CartContext: Successfully added item to cart");
      return true;
    } catch (error) {
      console.error('CartContext: Error adding item to cart:', error);
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
    console.log("CartContext: Removing item from cart:", id);
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    console.log("CartContext: Updating quantity for item:", id, "to:", quantity);
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
    console.log("CartContext: Clearing cart");
    setCart([]);
    CartValidationService.clearStoredCart();
  };

  // Keep validateCart method for compatibility but make it empty
  const validateCart = async () => {
    console.log('CartContext: Cart validation disabled - accepting all items');
    // No validation performed - method kept for compatibility only
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

  console.log("CartContext: Rendering with cart:", cart.length, "items");

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
