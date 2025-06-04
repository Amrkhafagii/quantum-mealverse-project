
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

export interface StatusValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Unified order status service that handles both nutrition-generated and traditional orders
 */
export const unifiedOrderStatusService = {
  /**
   * Validate if a status transition is logically valid
   */
  validateStatusTransition(currentStatus: string, newStatus: OrderStatus, restaurantId?: string): StatusValidationResult {
    const result: StatusValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Define valid status transitions
    const validTransitions: Record<string, OrderStatus[]> = {
      'pending': [OrderStatus.RESTAURANT_ASSIGNED, OrderStatus.CANCELLED],
      'awaiting_restaurant': [OrderStatus.RESTAURANT_ASSIGNED, OrderStatus.CANCELLED],
      'restaurant_assigned': [OrderStatus.RESTAURANT_ACCEPTED, OrderStatus.RESTAURANT_REJECTED, OrderStatus.CANCELLED],
      'restaurant_accepted': [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      'preparing': [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
      'ready_for_pickup': [OrderStatus.ON_THE_WAY, OrderStatus.CANCELLED],
      'on_the_way': [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      'delivered': [], // Terminal state
      'cancelled': [], // Terminal state
      'restaurant_rejected': [OrderStatus.RESTAURANT_ASSIGNED] // Can be reassigned
    };

    // Check if transition is valid
    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      result.isValid = false;
      result.errors.push(`Invalid status transition from '${currentStatus}' to '${newStatus}'`);
    }

    // Validate restaurant ID requirements
    const statusesRequiringRestaurant = [
      OrderStatus.RESTAURANT_ACCEPTED,
      OrderStatus.PREPARING,
      OrderStatus.READY_FOR_PICKUP
    ];

    if (statusesRequiringRestaurant.includes(newStatus) && !restaurantId) {
      result.isValid = false;
      result.errors.push(`Status '${newStatus}' requires a restaurant_id but none was provided`);
    }

    // Add warnings for unusual transitions
    if (currentStatus === 'restaurant_rejected' && newStatus === OrderStatus.RESTAURANT_ASSIGNED) {
      result.warnings.push('Order is being reassigned after rejection');
    }

    return result;
  },

  /**
   * Update order status with enhanced validation and logging
   */
  async updateOrderStatus({
    orderId,
    newStatus,
    restaurantId,
    assignmentSource,
    metadata = {},
    changedBy,
    changedByType = 'system'
  }: UnifiedOrderStatusUpdate): Promise<boolean> {
    try {
      console.log('🔄 Starting unified order status update:', {
        orderId,
        newStatus,
        restaurantId,
        assignmentSource,
        changedByType
      });

      // Get current order state for validation
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('status, restaurant_id, assignment_source')
        .eq('id', orderId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching current order state:', fetchError);
        return false;
      }

      if (!currentOrder) {
        console.error('❌ Order not found:', orderId);
        return false;
      }

      // Validate status transition
      const validation = this.validateStatusTransition(
        currentOrder.status,
        newStatus,
        restaurantId || currentOrder.restaurant_id
      );

      if (!validation.isValid) {
        console.error('❌ Status validation failed:', validation.errors);
        throw new Error(`Status validation failed: ${validation.errors.join(', ')}`);
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn('⚠️ Status transition warnings:', validation.warnings);
      }

      // Ensure changedByType is valid for database constraint
      const validChangedByType: 'system' | 'customer' | 'restaurant' | 'delivery' = 
        ['system', 'customer', 'restaurant', 'delivery'].includes(changedByType) 
          ? changedByType as 'system' | 'customer' | 'restaurant' | 'delivery'
          : 'system';

      // Prepare update data with enhanced logic
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        // Handle restaurant_id population logic
        ...(this.shouldUpdateRestaurantId(newStatus, restaurantId, currentOrder.restaurant_id) && {
          restaurant_id: restaurantId || currentOrder.restaurant_id
        }),
        // Preserve or set assignment source
        ...(assignmentSource && { assignment_source: assignmentSource })
      };

      // Add appropriate timestamp fields based on status
      const timestampField = this.getTimestampFieldForStatus(newStatus);
      if (timestampField) {
        updateData[timestampField] = new Date().toISOString();
      }

      console.log('📝 Updating order with data:', updateData);

      // Update the order
      const { error: orderError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (orderError) {
        console.error('❌ Error updating order status:', orderError);
        return false;
      }

      // Record in order history with enhanced metadata
      const historyMetadata = {
        ...metadata,
        assignment_source: assignmentSource || currentOrder.assignment_source,
        unified_tracking: true,
        previous_status: currentOrder.status,
        restaurant_id_changed: updateData.restaurant_id !== currentOrder.restaurant_id,
        validation_warnings: validation.warnings
      };

      await recordOrderHistory(
        orderId,
        newStatus,
        restaurantId || currentOrder.restaurant_id,
        historyMetadata,
        undefined,
        changedBy,
        validChangedByType
      );

      console.log(`✅ Successfully updated order ${orderId} from ${currentOrder.status} to ${newStatus}`);
      return true;
    } catch (error) {
      console.error('❌ Error in unified order status update:', error);
      return false;
    }
  },

  /**
   * Determine if restaurant_id should be updated based on status and current state
   */
  shouldUpdateRestaurantId(newStatus: OrderStatus, providedRestaurantId?: string, currentRestaurantId?: string): boolean {
    // Always update if we have a new restaurant ID
    if (providedRestaurantId && providedRestaurantId !== currentRestaurantId) {
      return true;
    }

    // Don't update if restaurant is already set and no new one provided
    if (currentRestaurantId && !providedRestaurantId) {
      return false;
    }

    // Update for statuses that require restaurant assignment
    const statusesRequiringRestaurant = [
      OrderStatus.RESTAURANT_ASSIGNED,
      OrderStatus.RESTAURANT_ACCEPTED,
      OrderStatus.PREPARING,
      OrderStatus.READY_FOR_PICKUP
    ];

    return statusesRequiringRestaurant.includes(newStatus) && providedRestaurantId;
  },

  /**
   * Get the appropriate timestamp field for a given status
   */
  getTimestampFieldForStatus(status: OrderStatus): string | null {
    const timestampMap: Record<OrderStatus, string> = {
      [OrderStatus.RESTAURANT_ASSIGNED]: 'assigned_at',
      [OrderStatus.RESTAURANT_ACCEPTED]: 'accepted_at',
      [OrderStatus.PREPARING]: 'preparation_started_at',
      [OrderStatus.READY_FOR_PICKUP]: 'ready_at',
      [OrderStatus.ON_THE_WAY]: 'picked_up_at',
      [OrderStatus.DELIVERED]: 'delivered_at',
      [OrderStatus.CANCELLED]: 'cancelled_at',
      [OrderStatus.RESTAURANT_REJECTED]: null
    };

    return timestampMap[status] || null;
  },

  /**
   * Get unified order status with tracking information
   */
  async getOrderStatusWithTracking(orderId: string): Promise<any> {
    try {
      console.log('🔍 Fetching order status with tracking for:', orderId);

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
        console.error('❌ Error fetching order status:', error);
        return null;
      }

      const result = {
        ...order,
        statusHistory: order.order_history || [],
        isUnifiedTracking: true
      };

      console.log('✅ Successfully fetched order with tracking data');
      return result;
    } catch (error) {
      console.error('❌ Error in getOrderStatusWithTracking:', error);
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
      console.log('🏪 Updating restaurant assignment status:', {
        assignmentId,
        orderId,
        newStatus,
        restaurantId
      });

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
        console.error('❌ Error updating assignment:', assignmentError);
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
        const success = await this.updateOrderStatus({
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

        if (!success) {
          console.error('❌ Failed to update order status after assignment update');
          return false;
        }
      }

      console.log('✅ Successfully updated restaurant assignment status');
      return true;
    } catch (error) {
      console.error('❌ Error updating restaurant assignment status:', error);
      return false;
    }
  }
};
