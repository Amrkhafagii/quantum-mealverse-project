
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/types/database';

/**
 * Fix inconsistent order status by checking restaurant assignments
 * and updating the order status if needed
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
    
    // Only proceed if order is in a state that might need fixing
    if (!['pending', 'awaiting_restaurant', 'restaurant_assigned', 'restaurant_accepted'].includes(order.status)) {
      console.log(`Order ${orderId} has status ${order.status}, no fixing needed`);
      return false;
    }
    
    // Check if there's an accepted restaurant assignment
    const { data: acceptedAssignment, error: assignmentError } = await supabase
      .from('restaurant_assignments')
      .select('restaurant_id, status')
      .eq('order_id', orderId)
      .eq('status', 'accepted')
      .single();
      
    if (assignmentError) {
      // No accepted assignment found
      console.log(`No accepted assignment found for order ${orderId}`);
      return false;
    }
    
    if (acceptedAssignment) {
      // Restaurant has accepted the order, but order status doesn't reflect this
      let targetStatus = '';
      
      if (order.status === 'restaurant_accepted') {
        // If order is in accepted status, move it to preparing
        targetStatus = 'preparing';
        console.log(`Order ${orderId} is accepted but not in preparation, updating to preparing`);
      } else {
        // For other states, update to restaurant_accepted first
        targetStatus = 'restaurant_accepted';
        console.log(`Found accepted assignment for order ${orderId}, updating status from ${order.status} to ${targetStatus}`);
      }
      
      // Get restaurant name for the order history
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', acceptedAssignment.restaurant_id)
        .single();
        
      const restaurantName = restaurant?.name || 'Unknown Restaurant';
      
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: targetStatus, 
          restaurant_id: acceptedAssignment.restaurant_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (updateError) {
        console.error('Error updating order status:', updateError);
        return false;
      }
      
      // Add to order history - Convert note to Json compatible type
      const details = { note: 'Status fixed automatically due to inconsistency' } as unknown as Json;
      
      await supabase.from('order_history').insert({
        order_id: orderId,
        previous_status: order.status,
        status: targetStatus,
        restaurant_id: acceptedAssignment.restaurant_id,
        restaurant_name: restaurantName,
        changed_by_type: 'system',
        details: details
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error fixing order status:', error);
    return false;
  }
};
