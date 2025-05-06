
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
    if (!['pending', 'awaiting_restaurant', 'restaurant_assigned', 'restaurant_accepted', 'preparing', 'ready_for_pickup'].includes(order.status)) {
      console.log(`Order ${orderId} has status ${order.status}, no fixing needed`);
      return false;
    }
    
    // Check if there's an accepted restaurant assignment
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('restaurant_assignments')
      .select('restaurant_id, status')
      .eq('order_id', orderId);
      
    if (assignmentError) {
      console.error('Error fetching assignments:', assignmentError);
      return false;
    }
    
    // No assignments found
    if (!assignmentData || assignmentData.length === 0) {
      console.log(`No assignments found for order ${orderId}`);
      return false;
    }
    
    // Look for accepted or ready_for_pickup assignment
    const acceptedAssignment = assignmentData.find(a => a.status === 'accepted');
    const readyAssignment = assignmentData.find(a => a.status === 'ready_for_pickup');
    
    // Handle accepted assignment
    if (acceptedAssignment && order.status !== 'preparing' && order.status !== 'ready_for_pickup') {
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
    
    // Handle ready_for_pickup assignment
    if (readyAssignment && order.status !== 'ready_for_pickup') {
      // Restaurant has marked the order as ready, but order status doesn't reflect this
      const targetStatus = 'ready_for_pickup';
      console.log(`Found ready_for_pickup assignment for order ${orderId}, updating status from ${order.status} to ${targetStatus}`);
      
      // Get restaurant name for the order history
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', readyAssignment.restaurant_id)
        .single();
        
      const restaurantName = restaurant?.name || 'Unknown Restaurant';
      
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: targetStatus, 
          restaurant_id: readyAssignment.restaurant_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (updateError) {
        console.error('Error updating order status:', updateError);
        return false;
      }
      
      // Add to order history - Convert note to Json compatible type
      const details = { note: 'Status fixed automatically due to inconsistency with ready_for_pickup assignment' } as unknown as Json;
      
      await supabase.from('order_history').insert({
        order_id: orderId,
        previous_status: order.status,
        status: targetStatus,
        restaurant_id: readyAssignment.restaurant_id,
        restaurant_name: restaurantName,
        changed_by_type: 'system',
        details: details
      });
      
      return true;
    }
    
    // Handle preparing order with ready_for_pickup status
    if (order.status === 'ready_for_pickup' && !readyAssignment) {
      // Order is marked ready but assignment isn't, update the assignment
      const acceptedOrPreparingAssignment = assignmentData.find(a => 
        a.status === 'accepted' || a.status === 'preparing'
      );
      
      if (acceptedOrPreparingAssignment) {
        console.log(`Order ${orderId} is ready_for_pickup but assignment is not, updating assignment`);
        
        const { error: updateError } = await supabase
          .from('restaurant_assignments')
          .update({ 
            status: 'ready_for_pickup',
            updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId)
          .eq('restaurant_id', acceptedOrPreparingAssignment.restaurant_id);
          
        if (updateError) {
          console.error('Error updating assignment status:', updateError);
          return false;
        }
        
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error fixing order status:', error);
    return false;
  }
};
