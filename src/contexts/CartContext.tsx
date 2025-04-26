
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
  addItem: () => {},
  updateQuantity: () => {},
  totalAmount: 0,
  itemCount: 0
};

export const CartContext = createContext<CartContextType>(defaultContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Function to add a meal directly to the cart
  const addItem = (meal: MealType & { quantity: number }) => {
    try {
      console.log("Adding item to cart:", meal.name, "quantity:", meal.quantity);
      
      if (!meal || !meal.id) {
        console.error("Invalid meal object:", meal);
        return;
      }
      
      const quantity = meal.quantity || 1;
      const existingItemIndex = items.findIndex(item => item.meal.id === meal.id);
      
      if (existingItemIndex !== -1) {
        // If item already exists, update quantity
        const updatedItems = [...items];
        updatedItems[existingItemIndex].quantity += quantity;
        setItems(updatedItems);
        
        toast({
          title: "Cart updated",
          description: `Added more ${meal.name} to your cart`,
        });
      } else {
        // Add new item - create a proper CartItem object
        const cartItem: CartItem = {
          meal: {
            id: meal.id,
            name: meal.name,
            description: meal.description || '',
            price: meal.price,
            calories: meal.calories || 0,
            protein: meal.protein || 0,
            carbs: meal.carbs || 0,
            fat: meal.fat || 0,
            image_url: meal.image_url,
            is_active: meal.is_active,
            restaurant_id: meal.restaurant_id,
            created_at: meal.created_at,
            updated_at: meal.updated_at
          },
          quantity: quantity
        };
        
        setItems(prevItems => [...prevItems, cartItem]);
        
        toast({
          title: "Added to cart",
          description: `${meal.name} has been added to your cart`,
        });
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast({
        title: "Error",
        description: "Could not add item to cart. Please try again.",
      });
    }
  };

  // Original addToCart function for CartItem objects
  const addToCart = (item: CartItem) => {
    console.log("Add to cart called for:", item.meal.name, "quantity:", item.quantity);
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
      setItems(prevItems => [...prevItems, item]);
      
      toast({
        title: "Added to cart",
        description: `${item.meal.name} has been added to your cart`,
      });
    }
  };

  // Remove an item from the cart
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

  // Update the quantity of an item in the cart
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

  // Clear all items from the cart
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
