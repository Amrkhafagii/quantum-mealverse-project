import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/webhook';
import { recordOrderHistory } from './webhook/orderHistoryService';

export interface UnifiedOrderStatusUpdate {
  orderId: string;
  newStatus: OrderStatus;
  restaurantId?: string;
  assignmentSource?: 'nutrition_generated' | 'traditional';
  metadata?: Record<string, any>;
  changedBy?: string;
  changedByType?: 'system' | 'customer' | 'restaurant' | 'delivery';
}

/**
 * Unified order status service that handles both nutrition-generated and traditional orders
 */
export const unifiedOrderStatusService = {
  /**
   * Update order status with unified tracking for all order types
   */
  async updateOrderStatus({
    orderId,
    newStatus,
    restaurantId,
    assignmentSource,
    metadata = {},
    changedBy,
    changedByType = 'system'
  }: UnifiedOrderStatusUpdate): Promise<boolean> => {
    try {
      console.log('Updating unified order status:', {
        orderId,
        newStatus,
        restaurantId,
        assignmentSource
      });

      // Ensure changedByType is valid for database constraint
      const validChangedByType: 'system' | 'customer' | 'restaurant' | 'delivery' = 
        ['system', 'customer', 'restaurant', 'delivery'].includes(changedByType) 
          ? changedByType as 'system' | 'customer' | 'restaurant' | 'delivery'
          : 'system';

      // Prepare update data with timestamp fields
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(restaurantId && { restaurant_id: restaurantId }),
        ...(assignmentSource && { assignment_source: assignmentSource })
      };

      // Add appropriate timestamp fields based on status
      switch (newStatus) {
        case OrderStatus.RESTAURANT_ASSIGNED:
          updateData.assigned_at = new Date().toISOString();
          break;
        case OrderStatus.RESTAURANT_ACCEPTED:
          updateData.accepted_at = new Date().toISOString();
          break;
        case OrderStatus.PREPARING:
          updateData.preparation_started_at = new Date().toISOString();
          break;
        case OrderStatus.READY_FOR_PICKUP:
          updateData.ready_at = new Date().toISOString();
          break;
        case OrderStatus.ON_THE_WAY:
          updateData.picked_up_at = new Date().toISOString();
          break;
        case OrderStatus.DELIVERED:
          updateData.delivered_at = new Date().toISOString();
          break;
        case OrderStatus.CANCELLED:
          updateData.cancelled_at = new Date().toISOString();
          break;
      }

      // Update the order
      const { error: orderError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order status:', orderError);
        return false;
      }

      // Record in order history with assignment source
      await recordOrderHistory(
        orderId,
        newStatus,
        restaurantId,
        {
          ...metadata,
          assignment_source: assignmentSource,
          unified_tracking: true
        },
        undefined,
        changedBy,
        validChangedByType
      );

      console.log(`Successfully updated order ${orderId} to status ${newStatus}`);
      return true;
    } catch (error) {
      console.error('Error in unified order status update:', error);
      return false;
    }
  },

  /**
   * Get unified order status with tracking information
   */
  async getOrderStatusWithTracking(orderId: string): Promise<any> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_history(
            status,
            previous_status,
            created_at,
            restaurant_name,
            assignment_source,
            details
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order status:', error);
        return null;
      }

      return {
        ...order,
        statusHistory: order.order_history || [],
        isUnifiedTracking: true
      };
    } catch (error) {
      console.error('Error in getOrderStatusWithTracking:', error);
      return null;
    }
  },

  /**
   * Update restaurant assignment status for unified tracking
   */
  async updateRestaurantAssignmentStatus(
    assignmentId: string,
    orderId: string,
    newStatus: 'accepted' | 'rejected' | 'preparing' | 'ready_for_pickup',
    restaurantId: string,
    notes?: string
  ): Promise<boolean> {
    try {
      // Update restaurant assignment
      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .update({
          status: newStatus,
          responded_at: new Date().toISOString(),
          response_notes: notes
        })
        .eq('id', assignmentId);

      if (assignmentError) {
        console.error('Error updating assignment:', assignmentError);
        return false;
      }

      // Map assignment status to order status
      const orderStatusMap = {
        'accepted': OrderStatus.RESTAURANT_ACCEPTED,
        'rejected': OrderStatus.RESTAURANT_REJECTED,
        'preparing': OrderStatus.PREPARING,
        'ready_for_pickup': OrderStatus.READY_FOR_PICKUP
      };

      const orderStatus = orderStatusMap[newStatus];

      // Update order with unified tracking
      if (orderStatus) {
        await this.updateOrderStatus({
          orderId,
          newStatus: orderStatus,
          restaurantId,
          changedBy: restaurantId,
          changedByType: 'restaurant',
          metadata: {
            assignment_id: assignmentId,
            response_notes: notes
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating restaurant assignment status:', error);
      return false;
    }
  }
};
