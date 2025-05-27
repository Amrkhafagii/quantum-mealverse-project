
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MealPlanOrder {
  id: string;
  userId: string;
  mealPlanId: string;
  orderId: string;
  deliveryDate: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanOrderItem {
  id: string;
  mealPlanOrderId: string;
  mealId: string;
  quantity: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatsPerServing: number;
  fiberPerServing: number;
  sugarPerServing: number;
  sodiumPerServing: number;
  preparationStatus: 'pending' | 'preparing' | 'ready' | 'packaged' | 'delivered';
  preparationStartTime?: string;
  preparationEndTime?: string;
  chefNotes?: string;
}

export interface CreateMealPlanOrderData {
  mealPlanId: string;
  orderId: string;
  deliveryDate: string;
  items: Array<{
    mealId: string;
    quantity: number;
    nutritionalInfo: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      fiber: number;
      sugar: number;
      sodium: number;
    };
  }>;
  estimatedDeliveryTime?: string;
  notes?: string;
  totalNutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

export const useMealPlanOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<MealPlanOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMealPlanOrders();
    }
  }, [user]);

  const fetchMealPlanOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('meal_plan_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching meal plan orders:', err);
      setError('Failed to fetch meal plan orders');
    } finally {
      setLoading(false);
    }
  };

  const createMealPlanOrder = async (orderData: CreateMealPlanOrderData): Promise<MealPlanOrder | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const totalNutrition = orderData.totalNutrition || {
        calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0
      };

      // Create the meal plan order
      const { data: orderInserted, error: orderError } = await supabase
        .from('meal_plan_orders')
        .insert({
          user_id: user.id,
          meal_plan_id: orderData.mealPlanId,
          order_id: orderData.orderId,
          delivery_date: orderData.deliveryDate,
          estimated_delivery_time: orderData.estimatedDeliveryTime,
          notes: orderData.notes,
          total_calories: totalNutrition.calories,
          total_protein: totalNutrition.protein,
          total_carbs: totalNutrition.carbs,
          total_fats: totalNutrition.fats,
          total_fiber: totalNutrition.fiber,
          total_sugar: totalNutrition.sugar,
          total_sodium: totalNutrition.sodium
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create meal plan order items
      const orderItems = orderData.items.map(item => ({
        meal_plan_order_id: orderInserted.id,
        meal_id: item.mealId,
        quantity: item.quantity,
        calories_per_serving: item.nutritionalInfo.calories,
        protein_per_serving: item.nutritionalInfo.protein,
        carbs_per_serving: item.nutritionalInfo.carbs,
        fats_per_serving: item.nutritionalInfo.fats,
        fiber_per_serving: item.nutritionalInfo.fiber,
        sugar_per_serving: item.nutritionalInfo.sugar,
        sodium_per_serving: item.nutritionalInfo.sodium
      }));

      const { error: itemsError } = await supabase
        .from('meal_plan_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await fetchMealPlanOrders();
      return orderInserted;
    } catch (err) {
      console.error('Error creating meal plan order:', err);
      setError('Failed to create meal plan order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: MealPlanOrder['status']): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('meal_plan_orders')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'delivered' ? { actual_delivery_time: new Date().toISOString() } : {})
        })
        .eq('id', orderId);

      if (error) throw error;

      await fetchMealPlanOrders();
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
      return false;
    }
  };

  return {
    orders,
    loading,
    error,
    createMealPlanOrder,
    updateOrderStatus,
    refetch: fetchMealPlanOrders
  };
};
