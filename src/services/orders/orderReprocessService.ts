
import { supabase } from '@/integrations/supabase/client';
import { sendOrderToWebhookWithRetry } from './webhook/sendOrderWebhook';

export interface OrderReprocessResult {
  success: boolean;
  orderId: string;
  message: string;
  restaurantsFound?: number;
}

export class OrderReprocessService {
  /**
   * Reprocess an order that failed initial restaurant assignment
   */
  static async reprocessOrder(orderId: string): Promise<OrderReprocessResult> {
    try {
      console.log(`Reprocessing order ${orderId} for restaurant assignment`);

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, latitude, longitude, status, customer_name')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return {
          success: false,
          orderId,
          message: 'Order not found or error retrieving order details'
        };
      }

      if (!order.latitude || !order.longitude) {
        return {
          success: false,
          orderId,
          message: 'Order missing location data - cannot assign restaurants'
        };
      }

      // Check if order already has restaurant assignments
      const { data: existingAssignments } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', orderId);

      if (existingAssignments && existingAssignments.length > 0) {
        return {
          success: false,
          orderId,
          message: 'Order already has restaurant assignments'
        };
      }

      // Send order to webhook for reprocessing
      const webhookSuccess = await sendOrderToWebhookWithRetry(
        orderId,
        order.latitude,
        order.longitude,
        'reassign'
      );

      if (!webhookSuccess) {
        return {
          success: false,
          orderId,
          message: 'Failed to send order to assignment webhook'
        };
      }

      return {
        success: true,
        orderId,
        message: 'Order sent for restaurant assignment processing'
      };

    } catch (error) {
      console.error('Error reprocessing order:', error);
      return {
        success: false,
        orderId,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get orders that are stuck without restaurant assignments
   */
  static async getStuckOrders(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          formatted_order_id,
          customer_name,
          status,
          created_at,
          latitude,
          longitude
        `)
        .eq('status', 'pending')
        .is('restaurant_id', null)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stuck orders:', error);
        return [];
      }

      // Filter out orders that already have assignments
      const ordersWithoutAssignments = [];
      
      for (const order of data || []) {
        const { data: assignments } = await supabase
          .from('restaurant_assignments')
          .select('id')
          .eq('order_id', order.id)
          .limit(1);

        if (!assignments || assignments.length === 0) {
          ordersWithoutAssignments.push(order);
        }
      }

      return ordersWithoutAssignments;
    } catch (error) {
      console.error('Error getting stuck orders:', error);
      return [];
    }
  }
}
