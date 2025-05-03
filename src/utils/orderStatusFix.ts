
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
    
    // Check for the most recent restaurant_assignment with a meaningful status
    // We'll check in priority order: ready_for_pickup, preparing, accepted
    
    // First check ready_for_pickup
    const { data: readyAssignment, error: readyError } = await supabase
      .from('restaurant_assignments')
      .select('restaurant_id, id')
      .eq('order_id', orderId)
      .eq('status', 'ready_for_pickup')
      .maybeSingle();
      
    if (!readyError && readyAssignment) {
      console.log(`Found ready_for_pickup assignment. Fixing order status to ready_for_pickup`);
      
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: OrderStatus.READY_FOR_PICKUP,
          restaurant_id: readyAssignment.restaurant_id,
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
        OrderStatus.READY_FOR_PICKUP,
        readyAssignment.restaurant_id,
        {
          assignment_id: readyAssignment.id,
          manually_fixed: true,
          previous_status: order.status
        },
        undefined,
        'system',
        'system'
      );
      
      console.log(`Successfully fixed order ${orderId} status to ready_for_pickup`);
      return true;
    }
    
    // Check for preparing status
    const { data: preparingAssignment, error: preparingError } = await supabase
      .from('restaurant_assignments')
      .select('restaurant_id, id')
      .eq('order_id', orderId)
      .eq('status', 'preparing')
      .maybeSingle();
      
    if (!preparingError && preparingAssignment) {
      console.log(`Found preparing assignment. Fixing order status to preparing`);
      
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: OrderStatus.PREPARING,
          restaurant_id: preparingAssignment.restaurant_id,
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
        OrderStatus.PREPARING,
        preparingAssignment.restaurant_id,
        {
          assignment_id: preparingAssignment.id,
          manually_fixed: true,
          previous_status: order.status
        },
        undefined,
        'system',
        'system'
      );
      
      console.log(`Successfully fixed order ${orderId} status to preparing`);
      return true;
    }
    
    // Check for accepted status if not in a further status
    const { data: acceptedAssignment, error: assignmentError } = await supabase
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
    if (!acceptedAssignment) {
      console.log('No accepted restaurant assignment found');
      return false;
    }
    
    // If the order isn't already in restaurant_accepted status
    if (order.status !== OrderStatus.RESTAURANT_ACCEPTED) {
      console.log(`Found accepted restaurant assignment. Fixing order status to restaurant_accepted`);
      
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: OrderStatus.RESTAURANT_ACCEPTED,
          restaurant_id: acceptedAssignment.restaurant_id,
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
        acceptedAssignment.restaurant_id,
        {
          assignment_id: acceptedAssignment.id,
          manually_fixed: true,
          previous_status: order.status
        },
        undefined,
        'system',
        'system'
      );
      
      console.log(`Successfully fixed order ${orderId} status to restaurant_accepted`);
      return true;
    }
    
    console.log("No status fix needed or could not determine correct status.");
    return false;
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
