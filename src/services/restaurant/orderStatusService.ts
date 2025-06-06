
import { supabase } from '@/integrations/supabase/client';
import { recordRestaurantOrderHistory } from '@/services/orders/webhook/orderHistoryService';
import { toast } from '@/hooks/use-toast';

export interface OrderStatusUpdateParams {
  orderId: string;
  status: string;
  restaurantId: string;
  notes?: string;
}

export const restaurantOrderStatusService = {
  /**
   * Updates order status from restaurant interface with proper history tracking
   */
  async updateOrderStatus({
    orderId,
    status,
    restaurantId,
    notes
  }: OrderStatusUpdateParams): Promise<boolean> {
    try {
      console.log(`Restaurant updating order ${orderId} to status ${status}`);

      // Update the order status in the main orders table
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ 
          status,
          restaurant_id: restaurantId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderUpdateError) {
        console.error('Error updating order status:', orderUpdateError);
        throw orderUpdateError;
      }

      // Record the history entry with restaurant context
      await recordRestaurantOrderHistory(
        orderId,
        status,
        restaurantId,
        {
          notes,
          source: 'restaurant_dashboard',
          timestamp: new Date().toISOString()
        }
      );

      toast({
        title: 'Order Updated',
        description: `Order status changed to ${status}`,
      });

      return true;
    } catch (error) {
      console.error('Error in restaurant order status service:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
      return false;
    }
  },

  /**
   * Accepts a restaurant assignment
   */
  async acceptOrder(orderId: string, restaurantId: string, notes?: string): Promise<boolean> {
    return this.updateOrderStatus({
      orderId,
      status: 'restaurant_accepted',
      restaurantId,
      notes: notes || 'Order accepted by restaurant'
    });
  },

  /**
   * Rejects a restaurant assignment
   */
  async rejectOrder(orderId: string, restaurantId: string, reason?: string): Promise<boolean> {
    return this.updateOrderStatus({
      orderId,
      status: 'restaurant_rejected',
      restaurantId,
      notes: reason || 'Order rejected by restaurant'
    });
  },

  /**
   * Marks order as preparing
   */
  async startPreparation(orderId: string, restaurantId: string): Promise<boolean> {
    return this.updateOrderStatus({
      orderId,
      status: 'preparing',
      restaurantId,
      notes: 'Order preparation started'
    });
  },

  /**
   * Marks order as ready for pickup
   */
  async markReady(orderId: string, restaurantId: string): Promise<boolean> {
    return this.updateOrderStatus({
      orderId,
      status: 'ready_for_pickup',
      restaurantId,
      notes: 'Order ready for pickup'
    });
  }
};
