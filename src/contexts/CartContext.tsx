
import React, { createContext, useContext, useState } from 'react';
import { CartItem } from '@/types/cart';
import { MealType } from '@/types/meal';
import { toast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  total: number;
  // Add missing properties and methods
  addItem: (meal: MealType & { quantity: number }) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  totalAmount: number;
  itemCount: number;
}

const defaultContext: CartContextType = {
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  total: 0,
  // Add missing properties and methods to default context
  addItem: () => {},
  updateQuantity: () => {},
  totalAmount: 0,
  itemCount: 0
};

export const CartContext = createContext<CartContextType>(defaultContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (meal: MealType & { quantity: number }) => {
    const existingItemIndex = items.findIndex(item => item.meal.id === meal.id);
    
    if (existingItemIndex !== -1) {
      // If item already exists, update quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += meal.quantity;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([...items, { meal: meal, quantity: meal.quantity }]);
    }
  };

  const addToCart = (item: CartItem) => {
    const existingItemIndex = items.findIndex(i => i.meal.id === item.meal.id);
    
    if (existingItemIndex !== -1) {
      // If item already exists, update quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += item.quantity;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([...items, item]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setItems(items.filter(item => item.meal.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    const updatedItems = items.map(item => 
      item.meal.id === itemId 
        ? { ...item, quantity } 
        : item
    );
    
    setItems(updatedItems);
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculate total amount (in USD)
  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.meal.price * item.quantity);
  }, 0);

  // Calculate item count
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addToCart,
        removeFromCart,
        clearCart,
        total: totalAmount,
        // Add the new methods and properties
        addItem,
        updateQuantity,
        totalAmount,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
