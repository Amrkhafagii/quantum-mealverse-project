
import React, { createContext } from 'react';

export const CartContext = createContext<any>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <CartContext.Provider value={{}}>{children}</CartContext.Provider>;
};
