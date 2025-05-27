
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

      // Create the meal plan order
      const { data: orderInserted, error: orderError } = await supabase
        .from('meal_plan_orders')
        .insert({
          user_id: user.id,
          meal_plan_id: orderData.mealPlanId,
          order_id: orderData.orderId,
          delivery_date: orderData.deliveryDate,
          estimated_delivery_time: orderData.estimatedDeliveryTime,
          notes: orderData.notes
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

      // Create preparation progress steps for each item
      const { data: insertedItems, error: fetchItemsError } = await supabase
        .from('meal_plan_order_items')
        .select('id')
        .eq('meal_plan_order_id', orderInserted.id);

      if (fetchItemsError) throw fetchItemsError;

      const preparationSteps = [];
      const stepTemplates = [
        { name: 'Prep Ingredients', description: 'Wash, chop, and prepare all ingredients', duration: 15 },
        { name: 'Cooking', description: 'Cook main components according to recipe', duration: 25 },
        { name: 'Plating', description: 'Arrange and present the meal', duration: 5 },
        { name: 'Quality Check', description: 'Final quality and temperature check', duration: 3 },
        { name: 'Packaging', description: 'Package for delivery with proper insulation', duration: 7 }
      ];

      for (const item of insertedItems) {
        for (const step of stepTemplates) {
          preparationSteps.push({
            meal_plan_order_item_id: item.id,
            step_name: step.name,
            step_description: step.description,
            estimated_duration_minutes: step.duration
          });
        }
      }

      const { error: stepsError } = await supabase
        .from('meal_preparation_progress')
        .insert(preparationSteps);

      if (stepsError) throw stepsError;

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

  const updatePreparationProgress = async (
    stepId: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'skipped',
    notes?: string
  ): Promise<boolean> => {
    try {
      setError(null);

      const updateData: any = { 
        status,
        ...(notes ? { notes } : {})
      };

      if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('meal_preparation_progress')
        .update(updateData)
        .eq('id', stepId);

      if (error) throw error;

      return true;
    } catch (err) {
      console.error('Error updating preparation progress:', err);
      setError('Failed to update preparation progress');
      return false;
    }
  };

  return {
    orders,
    loading,
    error,
    createMealPlanOrder,
    updateOrderStatus,
    updatePreparationProgress,
    refetch: fetchMealPlanOrders
  };
};
