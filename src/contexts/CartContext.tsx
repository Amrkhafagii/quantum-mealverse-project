
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
      
      toast({
        title: "Cart updated",
        description: `Added more ${meal.name} to your cart`,
      });
    } else {
      // Add new item
      setItems([...items, { meal: meal, quantity: meal.quantity }]);
      
      toast({
        title: "Added to cart",
        description: `${meal.name} has been added to your cart`,
      });
    }
  };

  const addToCart = (item: CartItem) => {
    const existingItemIndex = items.findIndex(i => i.meal.id === item.meal.id);
    
    if (existingItemIndex !== -1) {
      // If item already exists, update quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += item.quantity;
      setItems(updatedItems);
      
      toast({
        title: "Cart updated",
        description: `Added more ${item.meal.name} to your cart`,
      });
    } else {
      // Add new item
      setItems([...items, item]);
      
      toast({
        title: "Added to cart",
        description: `${item.meal.name} has been added to your cart`,
      });
    }
  };

  const removeFromCart = (itemId: string) => {
    const itemToRemove = items.find(item => item.meal.id === itemId);
    if (itemToRemove) {
      setItems(items.filter(item => item.meal.id !== itemId));
      
      toast({
        title: "Item removed",
        description: `${itemToRemove.meal.name} has been removed from your cart`,
      });
    }
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
    
    const updatedItem = updatedItems.find(item => item.meal.id === itemId);
    if (updatedItem) {
      toast({
        title: "Quantity updated",
        description: `${updatedItem.meal.name} quantity updated to ${quantity}`,
      });
    }
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
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
