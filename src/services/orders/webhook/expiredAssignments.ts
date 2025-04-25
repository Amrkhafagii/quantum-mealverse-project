
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/webhook';
import { recordOrderHistory } from './orderHistoryService';

/**
 * Checks and handles expired restaurant assignments with proper state transitions
 */
export const checkExpiredAssignments = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();
    
    // Find all assignments that have expired but still have pending status
    const { data: expiredAssignments, error } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, order_id, expires_at')
      .eq('status', 'pending')
      .lt('expires_at', now);
    
    if (error || !expiredAssignments || expiredAssignments.length === 0) {
      return;
    }
    
    // Process expired assignments
    for (const assignment of expiredAssignments) {
      // Use a transaction to ensure data consistency
      const { data: transaction, error: txError } = await supabase.rpc(
        'handle_expired_assignment',
        { 
          p_assignment_id: assignment.id,
          p_order_id: assignment.order_id,
          p_restaurant_id: assignment.restaurant_id,
          p_current_time: now
        }
      );
      
      if (txError) {
        console.error('Error handling expired assignment:', txError);
        
        // Fallback if RPC fails: Update assignment status directly
        await supabase
          .from('restaurant_assignments')
          .update({ status: 'expired' })
          .eq('id', assignment.id);
        
        // Record in order history
        await recordOrderHistory(
          assignment.order_id,
          OrderStatus.EXPIRED_ASSIGNMENT,
          assignment.restaurant_id,
          { assignment_id: assignment.id, expires_at: assignment.expires_at },
          now
        );
      }
      
      // Check if this order has any remaining pending assignments
      const { data: pendingAssignments } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', assignment.order_id)
        .eq('status', 'pending');
      
      // Check if any restaurant has accepted it
      const { data: acceptedAssignments } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', assignment.order_id)
        .eq('status', 'accepted');
      
      // If no more pending assignments and no acceptance, mark the order as no restaurant accepted
      if ((!pendingAssignments || pendingAssignments.length === 0) && 
          (!acceptedAssignments || acceptedAssignments.length === 0)) {
        
        // Get current order status
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('status')
          .eq('id', assignment.order_id)
          .single();
          
        // Only update if the order is in a state that can transition to NO_RESTAURANT_ACCEPTED
        if (currentOrder && 
            (currentOrder.status === OrderStatus.RESTAURANT_ASSIGNED || 
             currentOrder.status === OrderStatus.AWAITING_RESTAURANT)) {
          
          // Update the order status
          await supabase
            .from('orders')
            .update({ status: OrderStatus.NO_RESTAURANT_ACCEPTED })
            .eq('id', assignment.order_id);
          
          // Record in order history
          await recordOrderHistory(
            assignment.order_id,
            OrderStatus.NO_RESTAURANT_ACCEPTED,
            null,
            { reason: 'All restaurants rejected or assignments expired' }
          );
          
          // Update status table
          await supabase.from('status').insert({
            order_id: assignment.order_id,
            status: OrderStatus.NO_RESTAURANT_ACCEPTED,
            updated_by: 'system'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking expired assignments:', error);
  }
};
