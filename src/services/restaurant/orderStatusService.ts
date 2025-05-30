
import { supabase } from '@/integrations/supabase/client';
import { recordRestaurantOrderHistory } from '@/services/orders/webhook/orderHistoryService';
import { toast } from '@/hooks/use-toast';

export interface OrderStatusUpdateParams {
  orderId: string;
  status: string;
  restaurantId: string;
  changedBy?: string;
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
    changedBy,
    notes
  }: OrderStatusUpdateParams): Promise<boolean> => {
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
        changedBy,
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
  async acceptOrder(orderId: string, restaurantId: string, changedBy?: string, notes?: string): Promise<boolean> {
    return this.updateOrderStatus({
      orderId,
      status: 'restaurant_accepted',
      restaurantId,
      changedBy,
      notes: notes || 'Order accepted by restaurant'
    });
  },

  /**
   * Rejects a restaurant assignment
   */
  async rejectOrder(orderId: string, restaurantId: string, changedBy?: string, reason?: string): Promise<boolean> {
    return this.updateOrderStatus({
      orderId,
      status: 'restaurant_rejected',
      restaurantId,
      changedBy,
      notes: reason || 'Order rejected by restaurant'
    });
  },

  /**
   * Marks order as preparing
   */
  async startPreparation(orderId: string, restaurantId: string, changedBy?: string): Promise<boolean> {
    return this.updateOrderStatus({
      orderId,
      status: 'preparing',
      restaurantId,
      changedBy,
      notes: 'Order preparation started'
    });
  },

  /**
   * Marks order as ready for pickup
   */
  async markReady(orderId: string, restaurantId: string, changedBy?: string): Promise<boolean> {
    return this.updateOrderStatus({
      orderId,
      status: 'ready_for_pickup',
      restaurantId,
      changedBy,
      notes: 'Order ready for pickup'
    });
  }
};
