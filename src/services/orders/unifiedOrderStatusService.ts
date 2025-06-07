
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/webhook';
import { recordOrderHistory } from '../orders/webhook/orderHistoryService';

interface UpdateOrderStatusParams {
  orderId: string;
  newStatus: OrderStatus;
  restaurantId?: string;
  assignmentSource?: string;
  metadata?: Record<string, any>;
}

interface OrderStatusData {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_address: string;
  city?: string;
  notes?: string;
  delivery_method?: string;
  payment_method?: string;
  delivery_fee?: number;
  subtotal?: number;
  total: number;
  status: string;
  latitude?: number;
  longitude?: number;
  assignment_source: string;
  created_at: string;
  updated_at: string;
  formatted_order_id?: string;
  restaurant_id?: string;
  restaurant?: {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
  };
  statusHistory?: any[];
  isUnifiedTracking: boolean;
}

export class UnifiedOrderStatusService {
  /**
   * Get comprehensive order status data including history
   */
  static async getOrderStatusWithTracking(orderId: string): Promise<OrderStatusData | null> {
    try {
      console.log('🔍 Fetching unified order status for:', orderId);

      // Get order data with restaurant information
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants!orders_restaurant_id_fkey (
            id,
            name,
            latitude,
            longitude
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('❌ Error fetching order:', orderError);
        throw orderError;
      }

      if (!orderData) {
        console.warn('⚠️ Order not found:', orderId);
        return null;
      }

      // Get order history
      const { data: historyData, error: historyError } = await supabase
        .from('order_history')
        .select(`
          *,
          restaurant:restaurants!order_history_restaurant_id_fkey (
            name
          )
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (historyError) {
        console.warn('⚠️ Could not fetch order history:', historyError);
      }

      const result: OrderStatusData = {
        ...orderData,
        statusHistory: historyData || [],
        isUnifiedTracking: true
      };

      console.log('✅ Order status data retrieved:', {
        orderId,
        status: result.status,
        historyCount: result.statusHistory?.length || 0
      });

      return result;
    } catch (error) {
      console.error('❌ Error in getOrderStatusWithTracking:', error);
      throw error;
    }
  }

  /**
   * Update order status with comprehensive tracking and validation
   */
  static async updateOrderStatus(params: UpdateOrderStatusParams): Promise<boolean> {
    const {
      orderId,
      newStatus,
      restaurantId,
      assignmentSource,
      metadata = {}
    } = params;

    try {
      console.log('🔄 Updating order status:', {
        orderId,
        newStatus,
        restaurantId
      });

      // First, get the current order to validate the transition
      const currentOrder = await this.getOrderStatusWithTracking(orderId);
      if (!currentOrder) {
        console.error('❌ Cannot update status: Order not found');
        return false;
      }

      // Validate status transition
      if (!this.isValidStatusTransition(currentOrder.status, newStatus)) {
        console.error('❌ Invalid status transition:', {
          from: currentOrder.status,
          to: newStatus
        });
        return false;
      }

      // Prepare update data
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Add restaurant_id if this is a restaurant acceptance
      if (newStatus === OrderStatus.RESTAURANT_ACCEPTED && restaurantId) {
        updateData.restaurant_id = restaurantId;
      }

      // Update the order
      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) {
        console.error('❌ Failed to update order status:', updateError);
        return false;
      }

      // Record in order history with enhanced metadata
      const historyMetadata = {
        ...metadata,
        assignment_source: assignmentSource || currentOrder.assignment_source,
        previous_status: currentOrder.status,
        status_change_timestamp: new Date().toISOString()
      };

      await recordOrderHistory(
        orderId,
        newStatus,
        restaurantId,
        historyMetadata
      );

      console.log('✅ Order status updated successfully:', {
        orderId,
        from: currentOrder.status,
        to: newStatus
      });

      return true;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      return false;
    }
  }

  /**
   * Validate if a status transition is allowed
   */
  private static isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    // Define valid transitions based on business logic
    const validTransitions: Record<string, string[]> = {
      'pending': ['awaiting_restaurant', 'cancelled'],
      'awaiting_restaurant': ['restaurant_assigned', 'cancelled', 'no_restaurant_available'],
      'restaurant_assigned': ['restaurant_accepted', 'restaurant_rejected', 'expired_assignment', 'cancelled'],
      'restaurant_accepted': ['processing', 'preparing', 'cancelled'],
      'processing': ['preparing', 'cancelled'],
      'preparing': ['ready_for_pickup', 'cancelled'],
      'ready_for_pickup': ['on_the_way', 'cancelled'],
      'on_the_way': ['delivered', 'cancelled'],
      'delivered': ['refunded'],
      'cancelled': ['refunded'],
      'restaurant_rejected': ['awaiting_restaurant', 'cancelled'],
      'expired_assignment': ['awaiting_restaurant', 'cancelled'],
      'no_restaurant_available': ['cancelled', 'awaiting_restaurant']
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    const isValid = allowedTransitions.includes(newStatus);

    if (!isValid) {
      console.warn('⚠️ Invalid status transition attempted:', {
        from: currentStatus,
        to: newStatus,
        allowed: allowedTransitions
      });
    }

    return isValid;
  }

  /**
   * Get user-friendly status messages
   */
  static getStatusMessage(status: string): string {
    const statusMessages: Record<string, string> = {
      'pending': 'Order received and being processed',
      'awaiting_restaurant': 'Looking for available restaurants',
      'restaurant_assigned': 'Restaurant has been assigned',
      'restaurant_accepted': 'Restaurant accepted your order',
      'processing': 'Order is being processed',
      'preparing': 'Your order is being prepared',
      'ready_for_pickup': 'Order is ready for pickup',
      'on_the_way': 'Your order is on the way',
      'delivered': 'Order has been delivered',
      'cancelled': 'Order has been cancelled',
      'restaurant_rejected': 'Restaurant declined the order',
      'expired_assignment': 'Assignment expired',
      'no_restaurant_available': 'No restaurant available'
    };

    return statusMessages[status] || 'Order status updated';
  }

  /**
   * Check if an order can be cancelled
   */
  static canCancelOrder(status: string): boolean {
    const cancellableStatuses = [
      'pending',
      'awaiting_restaurant',
      'restaurant_assigned',
      'restaurant_accepted',
      'processing',
      'preparing'
    ];

    return cancellableStatuses.includes(status);
  }

  /**
   * Get the next expected status for an order
   */
  static getNextExpectedStatus(currentStatus: string): string | null {
    const statusFlow: Record<string, string> = {
      'pending': 'awaiting_restaurant',
      'awaiting_restaurant': 'restaurant_assigned',
      'restaurant_assigned': 'restaurant_accepted',
      'restaurant_accepted': 'preparing',
      'processing': 'preparing',
      'preparing': 'ready_for_pickup',
      'ready_for_pickup': 'on_the_way',
      'on_the_way': 'delivered'
    };

    return statusFlow[currentStatus] || null;
  }
}

export const unifiedOrderStatusService = UnifiedOrderStatusService;
