
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/webhook';
import { recordOrderHistory } from '@/services/orders/webhook/orderHistoryService';

/**
 * Utility function to manually fix an order's status based on restaurant assignments
 * This is useful when the webhook failed to update the order properly
 */
export const fixOrderStatus = async (orderId: string): Promise<boolean> => {
  try {
    console.log(`Attempting to fix status for order ${orderId}`);
    
    // Get current order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status, restaurant_id')
      .eq('id', orderId)
      .single();
      
    if (orderError) {
      console.error('Error fetching order:', orderError);
      return false;
    }
    
    // If order is already in an accepted state, no need to fix
    if (order.status !== 'pending' && order.status !== 'awaiting_restaurant') {
      console.log(`Order status is ${order.status}, no fix needed`);
      return true;
    }
    
    // Check if there's an accepted restaurant assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('restaurant_assignments')
      .select('restaurant_id, id')
      .eq('order_id', orderId)
      .eq('status', 'accepted')
      .maybeSingle();
      
    if (assignmentError) {
      console.error('Error checking assignment:', assignmentError);
      return false;
    }
    
    // If no accepted assignment, nothing to fix
    if (!assignment) {
      console.log('No accepted restaurant assignment found');
      return false;
    }
    
    console.log(`Found accepted restaurant assignment. Fixing order status to restaurant_accepted`);
    
    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: OrderStatus.RESTAURANT_ACCEPTED,
        restaurant_id: assignment.restaurant_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (updateError) {
      console.error('Error updating order status:', updateError);
      return false;
    }
    
    // Record the change in order history
    await recordOrderHistory(
      orderId,
      OrderStatus.RESTAURANT_ACCEPTED,
      assignment.restaurant_id,
      {
        assignment_id: assignment.id,
        manually_fixed: true,
        previous_status: order.status
      },
      undefined,
      'system',
      'system'
    );
    
    console.log(`Successfully fixed order ${orderId} status`);
    return true;
  } catch (error) {
    console.error('Error fixing order status:', error);
    return false;
  }
};

/**
 * Fixes the specific order mentioned by the user
 */
export const fixSpecificOrder = async (): Promise<boolean> => {
  const specificOrderId = '79645577-7bae-4d33-8779-4eaa554fac6e';
  return await fixOrderStatus(specificOrderId);
};
