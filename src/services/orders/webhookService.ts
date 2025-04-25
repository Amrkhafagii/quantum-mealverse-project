
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/webhook';
import { recordOrderHistory } from './webhook/orderHistoryService';

/**
 * Updates an order's status with proper validation and history tracking
 * @param orderId The ID of the order
 * @param newStatus The new status to apply
 * @param restaurantId Optional restaurant ID associated with the status change
 * @param details Additional details to record in the history
 * @param changedBy The ID of the user making the change (if applicable)
 * @param changedByType The type of user making the change (customer, restaurant, system, admin)
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  restaurantId?: string | null,
  details?: any,
  changedBy?: string,
  changedByType: 'system' | 'customer' | 'restaurant' | 'admin' = 'system'
): Promise<boolean> => {
  try {
    // Get current order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();
      
    if (orderError || !order) {
      console.error('Failed to fetch current order status:', orderError);
      return false;
    }
    
    // Validate the status transition
    const isValid = isValidStatusTransition(order.status, newStatus);
    if (!isValid) {
      console.error(`Invalid status transition from ${order.status} to ${newStatus}`);
      return false;
    }

    // Update the order status using a transaction for data integrity
    const { error: updateError } = await supabase.rpc('update_order_status_with_history', { 
      p_order_id: orderId,
      p_new_status: newStatus,
      p_restaurant_id: restaurantId,
      p_details: details ? JSON.stringify(details) : null,
      p_changed_by: changedBy,
      p_changed_by_type: changedByType
    });
    
    if (updateError) {
      console.error('Failed to update order status:', updateError);
      return false;
    }
    
    // Record in order history (as a backup/alternative to the RPC method)
    await recordOrderHistory(
      orderId, 
      newStatus, 
      restaurantId, 
      details, 
      undefined, 
      changedBy, 
      changedByType
    );
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

/**
 * Processes a refund request for an order
 */
export const processRefund = async (
  orderId: string,
  amount: number,
  reason: string,
  initiatedBy: string,
  initiatedByType: 'customer' | 'admin' = 'customer'
): Promise<boolean> => {
  try {
    // Begin a transaction for the refund process
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: OrderStatus.REFUNDED,
        refund_amount: amount,
        refund_status: 'completed'
      })
      .eq('id', orderId)
      .select()
      .single();
      
    if (error) {
      console.error('Failed to process refund:', error);
      return false;
    }
    
    // Record the refund in order history
    await recordOrderHistory(
      orderId,
      OrderStatus.REFUNDED,
      null,
      { 
        reason: reason, 
        amount: amount,
        previous_status: data.status 
      },
      undefined,
      initiatedBy,
      initiatedByType
    );
    
    return true;
  } catch (error) {
    console.error('Error processing refund:', error);
    return false;
  }
};

// Re-export the recordOrderHistory function from the module
export { recordOrderHistory } from './webhook/orderHistoryService';

// This file re-exports all webhook-related services for backward compatibility
export * from './webhook';
