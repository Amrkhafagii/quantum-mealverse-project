
import { supabase } from '@/integrations/supabase/client';

/**
 * Fixes any inconsistencies between order status and assignments
 * @param orderId The order ID to check and fix
 */
export async function fixOrderStatus(orderId: string): Promise<boolean> {
  try {
    console.log(`Fixing order status consistency for order ${orderId}`);
    
    // First, check the current state of the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status, restaurant_id')
      .eq('id', orderId)
      .single();
      
    if (orderError) {
      console.error(`Error fetching order ${orderId} status:`, orderError);
      return false;
    }
    
    // If the order is in an "accepted" state (by a restaurant), cancel all other assignments
    if (order.status === 'restaurant_accepted' || 
        order.status === 'accepted' || 
        order.status === 'preparing' || 
        order.status === 'ready_for_pickup' || 
        order.status === 'on_the_way' || 
        order.status === 'delivered') {
      
      // Cancel ALL restaurant assignments except for the accepted one
      const { error: cancelError } = await supabase
        .from('restaurant_assignments')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          details: { cancelled_reason: 'Order already accepted by another restaurant' }
        })
        .eq('order_id', orderId)
        .neq('restaurant_id', order.restaurant_id);
        
      if (cancelError) {
        console.error(`Error cancelling other assignments for order ${orderId}:`, cancelError);
        // Continue despite error
      } else {
        console.log(`Successfully cancelled all other assignments for order ${orderId}`);
      }
    }
    
    // If the order is rejected or not accepted by any restaurant
    if (order.status === 'restaurant_rejected' || order.status === 'no_restaurant_accepted') {
      // Ensure all assignments are marked as cancelled
      const { error: rejectError } = await supabase
        .from('restaurant_assignments')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          details: { cancelled_reason: 'Order was rejected or never accepted' }
        })
        .eq('order_id', orderId)
        .not('status', 'in', '("rejected", "expired")');
        
      if (rejectError) {
        console.error(`Error updating assignment status for rejected order ${orderId}:`, rejectError);
        // Continue despite error
      } else {
        console.log(`Successfully updated all assignments for rejected order ${orderId}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error fixing order status:`, error);
    return false;
  }
}
