
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
  assignment_source?: 'nutrition_generation' | 'traditional_ordering' | 'manual';
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
  
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    initializeCart();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      console.log("Phase 6: Saving integrated cart to localStorage:", cart);
      CartValidationService.updateStoredCart(cart);
    }
  }, [cart, isInitialized]);

  const initializeCart = async () => {
    try {
      console.log("Phase 6: Initializing integrated cart from localStorage");
      const validation = await CartValidationService.validateAndCleanStoredCart();
      
      console.log("Phase 6: Loaded integrated cart items:", validation.validItems);
      setCart(validation.validItems);
      
    } catch (error) {
      console.error('Phase 6: Error initializing integrated cart:', error);
      setCart([]);
    } finally {
      setIsInitialized(true);
      console.log("Phase 6: Integrated cart initialization complete");
    }
  };

  const addToCart = async (item: CartItem): Promise<boolean> => {
    try {
      console.log("Phase 6: Adding item to integrated cart:", item);
      
      // Phase 6: Direct addition without validation barriers
      const integratedItem: CartItem = {
        ...item,
        assignment_source: item.assignment_source || 'nutrition_generation'
      };

      console.log("Phase 6: Integrated item prepared:", integratedItem);

      setCart((prevCart) => {
        console.log("Phase 6: Previous integrated cart:", prevCart);
        const existingItem = prevCart.find((cartItem) => cartItem.id === integratedItem.id);
        
        if (existingItem) {
          console.log("Phase 6: Updating existing item in integrated cart");
          const updatedCart = prevCart.map((cartItem) =>
            cartItem.id === integratedItem.id
              ? { 
                  ...cartItem, 
                  quantity: cartItem.quantity + integratedItem.quantity,
                  restaurant_id: cartItem.restaurant_id || integratedItem.restaurant_id,
                  assignment_details: cartItem.assignment_details || integratedItem.assignment_details,
                  estimated_prep_time: cartItem.estimated_prep_time || integratedItem.estimated_prep_time,
                  distance_km: cartItem.distance_km || integratedItem.distance_km
                }
              : cartItem
          );
          console.log("Phase 6: Updated integrated cart with existing item:", updatedCart);
          return updatedCart;
        }
        
        console.log("Phase 6: Adding new item to integrated cart");
        const newCart = [...prevCart, integratedItem];
        console.log("Phase 6: New integrated cart:", newCart);
        return newCart;
      });

      const assignmentInfo = integratedItem.restaurant_id 
        ? ` (assigned to restaurant)` 
        : ` (will be assigned to restaurant)`;

      toast({
        title: "Item added",
        description: `"${integratedItem.name}" added to cart${assignmentInfo}`,
        variant: "default"
      });

      console.log("Phase 6: Successfully added item to integrated cart");
      return true;
    } catch (error) {
      console.error('Phase 6: Error adding item to integrated cart:', error);
      toast({
        title: "Error adding item",
        description: "Unable to add item to cart. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const addItem = addToCart;

  const removeFromCart = (id: string) => {
    console.log("Phase 6: Removing item from integrated cart:", id);
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    console.log("Phase 6: Updating quantity in integrated cart:", id, "to:", quantity);
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
    console.log("Phase 6: Clearing integrated cart");
    setCart([]);
    CartValidationService.clearStoredCart();
  };

  // Phase 6: Integrated validation (no-op for seamless flow)
  const validateCart = async () => {
    console.log('Phase 6: Integrated cart validation - no barriers, accepting all items');
  };

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

  const hasRestaurantAssignments = (): boolean => {
    return cart.some(item => item.restaurant_id);
  };

  console.log("Phase 6: Rendering integrated cart with:", cart.length, "items");

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        items: cart,
        totalAmount,
        addToCart, 
        addItem,
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
