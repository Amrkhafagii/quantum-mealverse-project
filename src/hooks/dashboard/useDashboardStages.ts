
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStageService, GroupedOrder } from '@/services/dashboard/dashboardStageService';
import { PreparationStageService } from '@/services/preparation/preparationStageService';
import { toast } from 'react-hot-toast';

export const useDashboardStages = (restaurantId: string) => {
  const [orders, setOrders] = useState<GroupedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const ordersData = await DashboardStageService.getRestaurantOrdersWithStages(restaurantId);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching dashboard orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!restaurantId) return;

    fetchOrders();

    // Set up real-time subscription for preparation stages
    const stageChannel = supabase
      .channel(`dashboard_stages_${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_preparation_stages',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          console.log('Stage update received, refreshing orders');
          fetchOrders();
        }
      )
      .subscribe();

    // Set up real-time subscription for order status changes
    const orderChannel = supabase
      .channel(`dashboard_orders_${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          console.log('Order update received, refreshing orders');
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      stageChannel.unsubscribe();
      orderChannel.unsubscribe();
    };
  }, [restaurantId]);

  const advanceStage = async (orderId: string, stageName: string, notes?: string) => {
    try {
      const result = await PreparationStageService.advanceStage(orderId, stageName, notes);
      if (result.success) {
        toast.success(`${stageName.replace('_', ' ')} stage completed!`);
        // Real-time will handle the refresh
      } else {
        toast.error(result.message || 'Failed to advance stage');
      }
      return result;
    } catch (error) {
      console.error('Error advancing stage:', error);
      toast.error('Failed to advance stage');
      return { success: false, message: 'Failed to advance stage' };
    }
  };

  const updateStageNotes = async (orderId: string, stageName: string, notes: string) => {
    try {
      const success = await PreparationStageService.updateStageNotes(orderId, stageName, notes);
      if (success) {
        toast.success('Notes updated successfully');
        // Real-time will handle the refresh
      } else {
        toast.error('Failed to update notes');
      }
      return success;
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
      return false;
    }
  };

  return {
    orders,
    isLoading,
    advanceStage,
    updateStageNotes,
    refetch: fetchOrders
  };
};
