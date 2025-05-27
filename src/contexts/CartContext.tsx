
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RestaurantAssignmentDetail } from '@/types/restaurantAssignment';
import { MenuValidationService } from '@/services/validation/menuValidationService';
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
  const { toast } = useToast();
  
  // Calculate total amount from cart items
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = async (item: CartItem): Promise<boolean> => {
    try {
      // Validate the item exists in menu_items table
      const validation = await MenuValidationService.validateMenuItem(item.id);
      
      if (!validation.isValid) {
        toast({
          title: "Item not available",
          description: `"${item.name}" is no longer available in our menu`,
          variant: "destructive"
        });
        return false;
      }

      setCart((prevCart) => {
        const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
        if (existingItem) {
          return prevCart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem
          );
        }
        return [...prevCart, item];
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
  };

  const validateCart = async () => {
    try {
      const validation = await MenuValidationService.validateCartItems(cart);
      
      if (validation.invalidItems.length > 0) {
        // Remove invalid items from cart
        setCart(validation.validItems);
        
        // Show toast for each invalid item
        validation.errors.forEach(error => {
          toast({
            title: "Item removed from cart",
            description: error,
            variant: "destructive"
          });
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
