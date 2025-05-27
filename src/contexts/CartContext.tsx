import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RestaurantAssignmentDetail } from '@/types/restaurantAssignment';

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
  addToCart: (item: CartItem) => void;
  addItem: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType>({
  cart: [],
  items: [],
  totalAmount: 0,
  addToCart: () => {},
  addItem: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

export const useCart = () => useContext(CartContext);

type CartProviderProps = {
  children: ReactNode;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Calculate total amount from cart items
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = (item: CartItem) => {
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
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
