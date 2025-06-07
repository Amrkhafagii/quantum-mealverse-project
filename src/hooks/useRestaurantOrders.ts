
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Order } from '@/types/order';

export const useRestaurantOrders = (restaurantId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching orders for restaurant:', restaurantId);

      // Query orders that are either assigned to this restaurant OR unassigned (pending assignments)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          customer_id,
          customer_name,
          customer_email,
          customer_phone,
          delivery_address,
          city,
          delivery_method,
          payment_method,
          status,
          total,
          created_at,
          notes,
          restaurant_id
        `)
        .or(`restaurant_id.eq.${restaurantId},restaurant_id.is.null`)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          if (itemsError) {
            console.error('Error fetching order items:', itemsError);
            return { 
              ...order, 
              order_items: [],
              delivery_fee: 0,
              subtotal: order.total || 0
            };
          }

          return {
            ...order,
            order_items: itemsData || [],
            delivery_fee: 0,
            subtotal: order.total || 0
          };
        })
      );

      console.log('Successfully fetched orders:', ordersWithItems.length);
      setOrders(ordersWithItems);
    } catch (err) {
      console.error('Error fetching restaurant orders:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to load restaurant orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId, toast]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    updateOrderStatus
  };
};
