
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
    
    if (error) {
      console.error('Error fetching expired assignments:', error);
      return;
    }
    
    if (!expiredAssignments || expiredAssignments.length === 0) {
      return;
    }
    
    console.log(`Found ${expiredAssignments.length} expired assignments to process`);
    
    // Batch update all expired assignments at once
    const expiredAssignmentIds = expiredAssignments.map(a => a.id);
    const { error: batchUpdateError } = await supabase
      .from('restaurant_assignments')
      .update({ 
        status: 'expired',
        updated_at: now
      })
      .in('id', expiredAssignmentIds);
      
    if (batchUpdateError) {
      console.error('Error in batch update of expired assignments:', batchUpdateError);
      // Fall back to individual updates if batch fails
      await handleIndividualUpdates(expiredAssignments, now);
    } else {
      console.log(`Successfully batch updated ${expiredAssignmentIds.length} expired assignments`);
    }
    
    // Process each assignment for history recording and order status updates
    const processedOrders = new Set<string>();
    
    for (const assignment of expiredAssignments) {
      try {
        // Record in order history - fix the call to match expected parameters
        await recordOrderHistory(
          assignment.order_id,
          OrderStatus.EXPIRED_ASSIGNMENT,
          assignment.restaurant_id || null,
          { assignment_id: assignment.id, expires_at: assignment.expires_at }
        );
        
        // Only process each order once for status updates
        if (!processedOrders.has(assignment.order_id)) {
          processedOrders.add(assignment.order_id);
          await handleOrderStatusUpdate(assignment.order_id, now);
        }
      } catch (err) {
        console.error(`Error processing assignment ${assignment.id} for order ${assignment.order_id}:`, err);
        // Continue processing other assignments even if one fails
      }
    }
  } catch (error) {
    console.error('Critical error in checkExpiredAssignments:', error);
  }
};

/**
 * Fallback to individual updates if batch update fails
 */
const handleIndividualUpdates = async (expiredAssignments: any[], now: string): Promise<void> => {
  console.log('Falling back to individual assignment updates');
  
  for (const assignment of expiredAssignments) {
    try {
      const { error: updateError } = await supabase
        .from('restaurant_assignments')
        .update({ 
          status: 'expired',
          updated_at: now
        })
        .eq('id', assignment.id);
        
      if (updateError) {
        console.error(`Error updating individual assignment ${assignment.id}:`, updateError);
      }
    } catch (err) {
      console.error(`Critical error updating assignment ${assignment.id}:`, err);
    }
  }
};

/**
 * Handle order status updates after assignment expiration
 */
const handleOrderStatusUpdate = async (orderId: string, now: string): Promise<void> => {
  try {
    // Check if this order has any remaining pending assignments
    const { data: pendingAssignments, error: pendingError } = await supabase
      .from('restaurant_assignments')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'pending');
      
    if (pendingError) {
      console.error(`Error checking pending assignments for order ${orderId}:`, pendingError);
      return;
    }
    
    // Check if any restaurant has accepted it
    const { data: acceptedAssignments, error: acceptedError } = await supabase
      .from('restaurant_assignments')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'accepted');
      
    if (acceptedError) {
      console.error(`Error checking accepted assignments for order ${orderId}:`, acceptedError);
      return;
    }
    
    // If no more pending assignments and no acceptance, mark the order as no restaurant accepted
    if ((!pendingAssignments || pendingAssignments.length === 0) && 
        (!acceptedAssignments || acceptedAssignments.length === 0)) {
      
      // Get current order status
      const { data: currentOrder, error: orderError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();
        
      if (orderError) {
        console.error(`Error fetching current order status for ${orderId}:`, orderError);
        return;
      }
        
      // Only update if the order is in a state that can transition to NO_RESTAURANT_ACCEPTED
      if (currentOrder && 
          (currentOrder.status === OrderStatus.RESTAURANT_ASSIGNED || 
           currentOrder.status === OrderStatus.AWAITING_RESTAURANT)) {
        
        // Update the order status
        const { error: updateOrderError } = await supabase
          .from('orders')
          .update({ 
            status: OrderStatus.NO_RESTAURANT_ACCEPTED,
            updated_at: now
          })
          .eq('id', orderId);
          
        if (updateOrderError) {
          console.error(`Error updating order status to NO_RESTAURANT_ACCEPTED for ${orderId}:`, updateOrderError);
          return;
        }
        
        // Record in order history
        await recordOrderHistory(
          orderId,
          OrderStatus.NO_RESTAURANT_ACCEPTED,
          null,
          { reason: 'All restaurants rejected or assignments expired' }
        );
        
        // Update status table
        const { error: statusError } = await supabase.from('status').insert({
          order_id: orderId,
          status: OrderStatus.NO_RESTAURANT_ACCEPTED,
          updated_by: 'system'
        });
        
        if (statusError) {
          console.error(`Error inserting status record for order ${orderId}:`, statusError);
        }
        
        console.log(`Successfully updated order ${orderId} to NO_RESTAURANT_ACCEPTED`);
      }
    }
  } catch (error) {
    console.error(`Critical error handling order status update for ${orderId}:`, error);
  }
};
