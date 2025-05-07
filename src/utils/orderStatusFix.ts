
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
      
      // Fetch restaurant location data for current restaurant if available
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('latitude, longitude, name')
        .eq('id', order.restaurant_id)
        .single();
      
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
      
      // Also check for any delivery assignments that might need location data
      const { data: deliveryAssignments } = await supabase
        .from('delivery_assignments')
        .select('id, latitude, longitude, status')
        .eq('order_id', orderId)
        .eq('restaurant_id', order.restaurant_id);
        
      // Update delivery assignment with restaurant coordinates if missing
      if (deliveryAssignments && deliveryAssignments.length > 0 && restaurant) {
        // Only update if the restaurant has coordinates and the assignment doesn't
        const needsUpdate = deliveryAssignments.some(
          assignment => (!assignment.latitude || !assignment.longitude) && restaurant.latitude && restaurant.longitude
        );
        
        if (needsUpdate) {
          await supabase
            .from('delivery_assignments')
            .update({
              latitude: restaurant.latitude,
              longitude: restaurant.longitude
            })
            .eq('order_id', orderId)
            .eq('restaurant_id', order.restaurant_id)
            .is('latitude', null);
            
          console.log(`Updated delivery assignments for order ${orderId} with restaurant location data`);
        }

        // Check for delivery status inconsistencies
        const activeDelivery = deliveryAssignments.find(a => ['assigned', 'picked_up', 'on_the_way', 'delivered'].includes(a.status));
        if (activeDelivery) {
          // Status mapping between delivery_assignments and orders tables
          const statusMap: Record<string, string> = {
            'picked_up': 'picked_up',
            'on_the_way': 'on_the_way',
            'delivered': 'delivered'
          };

          // If delivery status is ahead of order status, update order status to match
          if (statusMap[activeDelivery.status] && order.status !== statusMap[activeDelivery.status]) {
            console.log(`Fixing mismatch: delivery assignment status is '${activeDelivery.status}' but order status is '${order.status}'`);
            
            // Update the order status to match the delivery status
            await supabase
              .from('orders')
              .update({ 
                status: statusMap[activeDelivery.status], 
                updated_at: new Date().toISOString() 
              })
              .eq('id', orderId);
            
            // Check if the order history has this status
            const { data: history } = await supabase
              .from('order_history')
              .select('*')
              .eq('order_id', orderId)
              .eq('status', statusMap[activeDelivery.status])
              .maybeSingle();
            
            // If status is missing from history, add it
            if (!history) {
              // Get restaurant name
              const restaurantName = restaurant?.name || 'Unknown Restaurant';
              
              // Add the missing history entry
              await supabase.from('order_history').insert({
                order_id: orderId,
                status: statusMap[activeDelivery.status],
                previous_status: order.status,
                restaurant_id: order.restaurant_id,
                restaurant_name: restaurantName,
                details: {
                  delivery_assignment_id: activeDelivery.id,
                  auto_fixed: true,
                  fixed_at: new Date().toISOString()
                }
              });
              
              console.log(`Added missing order history entry for status '${statusMap[activeDelivery.status]}'`);
            }
          }
        }
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
