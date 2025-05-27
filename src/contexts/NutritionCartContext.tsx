
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export type NutritionCartItem = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  portion_size: number; // in grams
  food_category?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  usda_food_id?: string;
};

export type NutritionCartContextType = {
  items: NutritionCartItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  addItem: (item: Omit<NutritionCartItem, 'id'>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  convertToRestaurantCart: () => Promise<{ converted: any[], notFound: NutritionCartItem[] }>;
  isLoading: boolean;
};

const NutritionCartContext = createContext<NutritionCartContextType>({
  items: [],
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,
  addItem: async () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  convertToRestaurantCart: async () => ({ converted: [], notFound: [] }),
  isLoading: false,
});

export const useNutritionCart = () => useContext(NutritionCartContext);

type NutritionCartProviderProps = {
  children: ReactNode;
};

export const NutritionCartProvider: React.FC<NutritionCartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<NutritionCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate session ID for anonymous users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('nutrition-session-id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('nutrition-session-id', sessionId);
    }
    return sessionId;
  };

  // Calculate totals
  const totalCalories = items.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
  const totalProtein = items.reduce((sum, item) => sum + (item.protein * item.quantity), 0);
  const totalCarbs = items.reduce((sum, item) => sum + (item.carbs * item.quantity), 0);
  const totalFat = items.reduce((sum, item) => sum + (item.fat * item.quantity), 0);

  // Load cart items from database
  useEffect(() => {
    loadCartItems();
  }, [user]);

  const loadCartItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('nutrition_cart_items')
        .select('*')
        .or(user ? `user_id.eq.${user.id}` : `session_id.eq.${getSessionId()}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error('Error loading nutrition cart:', error);
      toast({
        title: "Error loading nutrition cart",
        description: "Please refresh the page and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (item: Omit<NutritionCartItem, 'id'>) => {
    try {
      const insertData = {
        ...item,
        user_id: user?.id || null,
        session_id: !user ? getSessionId() : null,
      };

      const { data, error } = await supabase
        .from('nutrition_cart_items')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [...prev, data]);
      
      toast({
        title: "Item added to nutrition plan",
        description: `"${item.name}" added to your meal plan`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error adding nutrition item:', error);
      toast({
        title: "Error adding item",
        description: "Unable to add item to nutrition plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('nutrition_cart_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing nutrition item:', error);
      toast({
        title: "Error removing item",
        description: "Unable to remove item from nutrition plan.",
        variant: "destructive"
      });
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    try {
      const { error } = await supabase
        .from('nutrition_cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    } catch (error) {
      console.error('Error updating nutrition item quantity:', error);
      toast({
        title: "Error updating quantity",
        description: "Unable to update item quantity.",
        variant: "destructive"
      });
    }
  };

  const clearCart = async () => {
    try {
      const { error } = await supabase
        .from('nutrition_cart_items')
        .delete()
        .or(user ? `user_id.eq.${user.id}` : `session_id.eq.${getSessionId()}`);

      if (error) throw error;

      setItems([]);
      
      toast({
        title: "Nutrition plan cleared",
        description: "All items removed from your meal plan",
        variant: "default"
      });
    } catch (error) {
      console.error('Error clearing nutrition cart:', error);
      toast({
        title: "Error clearing cart",
        description: "Unable to clear nutrition plan.",
        variant: "destructive"
      });
    }
  };

  const convertToRestaurantCart = async () => {
    try {
      // Get mappings for nutrition items to menu items
      const { data: mappings, error } = await supabase
        .from('meal_plan_to_menu_mappings')
        .select(`
          nutrition_food_name,
          menu_item_id,
          similarity_score,
          nutritional_accuracy,
          menu_items (*)
        `)
        .in('nutrition_food_name', items.map(item => item.name));

      if (error) throw error;

      const converted: any[] = [];
      const notFound: NutritionCartItem[] = [];

      items.forEach(nutritionItem => {
        const mapping = mappings?.find(m => m.nutrition_food_name === nutritionItem.name);
        
        if (mapping && mapping.menu_items) {
          // Convert to restaurant cart item format
          converted.push({
            id: mapping.menu_items.id,
            name: mapping.menu_items.name,
            price: mapping.menu_items.price,
            quantity: nutritionItem.quantity,
            description: mapping.menu_items.description,
            calories: mapping.menu_items.calories,
            protein: mapping.menu_items.protein,
            carbs: mapping.menu_items.carbs,
            fat: mapping.menu_items.fat,
            image_url: mapping.menu_items.image_url,
            restaurant_id: mapping.menu_items.restaurant_id,
          });
        } else {
          notFound.push(nutritionItem);
        }
      });

      return { converted, notFound };
    } catch (error) {
      console.error('Error converting to restaurant cart:', error);
      throw error;
    }
  };

  return (
    <NutritionCartContext.Provider
      value={{
        items,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        convertToRestaurantCart,
        isLoading
      }}
    >
      {children}
    </NutritionCartContext.Provider>
  );
};
