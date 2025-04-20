
import React, { createContext, useContext } from 'react';

interface CartContextType {
  items: any[];
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  total: number;
}

const defaultContext: CartContextType = {
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  total: 0
};

export const CartContext = createContext<CartContextType>(defaultContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Basic implementation to fix build errors
  return (
    <CartContext.Provider value={defaultContext}>
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
