
import { useState, useEffect, useCallback } from 'react';
import { DashboardStageService, GroupedOrder } from '@/services/dashboard/dashboardStageService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStages = (restaurantId: string) => {
  const [orders, setOrders] = useState<GroupedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Dashboard: Fetching orders with stages for restaurant:', restaurantId);
      
      const ordersData = await DashboardStageService.getRestaurantOrdersWithStages(restaurantId);
      
      console.log('Dashboard: Fetched orders:', ordersData.length);
      setOrders(ordersData);
      
      // Perform cleanup validation periodically
      const cleanup = await DashboardStageService.validateAndCleanupPreparationData(restaurantId);
      if (cleanup.cleaned > 0) {
        console.log(`Dashboard: Cleaned up ${cleanup.cleaned} inconsistent records`);
      }
      
      if (cleanup.errors.length > 0) {
        console.warn('Dashboard: Cleanup errors:', cleanup.errors);
      }
      
    } catch (err) {
      console.error('Dashboard: Error fetching orders with stages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preparation stages';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: "Failed to load order preparation stages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, toast]);

  const advanceStage = useCallback(async (orderId: string, stageName: string) => {
    try {
      console.log('Dashboard: Advancing stage:', { orderId, stageName });
      
      const success = await DashboardStageService.advanceToNextStage(orderId, stageName);
      
      if (success) {
        toast({
          title: "Stage Advanced",
          description: "Order stage has been advanced successfully",
        });
        
        // Refresh data
        await fetchOrders();
      } else {
        throw new Error('Failed to advance stage');
      }
      
      return success;
    } catch (error) {
      console.error('Dashboard: Error advancing stage:', error);
      toast({
        title: "Error",
        description: "Failed to advance preparation stage",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchOrders, toast]);

  const updateStageNotes = useCallback(async (stageName: string, notes: string) => {
    try {
      // Find the stage to update
      const orderWithStage = orders.find(order => 
        order.stages.some(stage => stage.stage_name === stageName)
      );
      
      if (!orderWithStage) {
        throw new Error('Stage not found');
      }
      
      const stage = orderWithStage.stages.find(s => s.stage_name === stageName);
      if (!stage) {
        throw new Error('Stage not found');
      }

      const { error } = await supabase
        .from('order_preparation_stages')
        .update({ notes })
        .eq('id', stage.stage_id);

      if (error) throw error;

      toast({
        title: "Notes Updated",
        description: "Stage notes have been updated successfully",
      });
      
      // Refresh data
      await fetchOrders();
      
      return true;
    } catch (error) {
      console.error('Dashboard: Error updating stage notes:', error);
      toast({
        title: "Error",
        description: "Failed to update stage notes",
        variant: "destructive",
      });
      return false;
    }
  }, [orders, fetchOrders, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!restaurantId) return;

    // Set up real-time subscription for order changes
    const channel = supabase
      .channel(`order_stages_${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('Dashboard: Order update received:', payload);
          fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_preparation_stages',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('Dashboard: Stage update received:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [restaurantId, fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
    advanceStage,
    updateStageNotes
  };
};
