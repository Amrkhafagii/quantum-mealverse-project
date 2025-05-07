
import { supabase } from '@/integrations/supabase/client';

/**
 * Manual utility to fix specific order status issues
 * This can be called from the browser console to repair broken order status flows
 */
export async function manualFixOrderStatus(orderId: string): Promise<boolean> {
  try {
    console.log(`Manually fixing order status for ${orderId}`);
    
    // 1. Get the current order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (orderError) {
      console.error('Failed to get order details:', orderError);
      return false;
    }
    
    // 2. Get the latest delivery assignment
    const { data: deliveryAssignment, error: deliveryError } = await supabase
      .from('delivery_assignments')
      .select('*')
      .eq('order_id', orderId)
      .in('status', ['assigned', 'picked_up', 'on_the_way', 'delivered'])
      .maybeSingle();
      
    if (deliveryError) {
      console.error('Failed to get delivery assignment:', deliveryError);
      return false;
    }
    
    if (!deliveryAssignment) {
      console.error('No delivery assignment found for this order');
      return false;
    }
    
    // 3. Get restaurant details
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('name')
      .eq('id', order.restaurant_id)
      .single();
      
    const restaurantName = restaurant?.name || 'Unknown Restaurant';
    
    // 4. Check for missing order history entries
    const { data: historyEntries } = await supabase
      .from('order_history')
      .select('status')
      .eq('order_id', orderId);
      
    const existingStatuses = new Set(historyEntries?.map(h => h.status) || []);
    
    // 5. Generate missing history entries
    const missingEntries = [];
    
    if (deliveryAssignment.status === 'picked_up' || deliveryAssignment.status === 'on_the_way' || deliveryAssignment.status === 'delivered') {
      if (!existingStatuses.has('picked_up')) {
        missingEntries.push({
          order_id: orderId,
          status: 'picked_up',
          restaurant_id: order.restaurant_id,
          restaurant_name: restaurantName,
          details: {
            manually_fixed: true,
            fixed_at: new Date().toISOString(),
            delivery_assignment_id: deliveryAssignment.id
          }
        });
      }
    }
    
    if (deliveryAssignment.status === 'on_the_way' || deliveryAssignment.status === 'delivered') {
      if (!existingStatuses.has('on_the_way')) {
        missingEntries.push({
          order_id: orderId,
          status: 'on_the_way',
          restaurant_id: order.restaurant_id,
          restaurant_name: restaurantName,
          details: {
            manually_fixed: true,
            fixed_at: new Date().toISOString(),
            delivery_assignment_id: deliveryAssignment.id
          }
        });
      }
    }
    
    if (deliveryAssignment.status === 'delivered') {
      if (!existingStatuses.has('delivered')) {
        missingEntries.push({
          order_id: orderId,
          status: 'delivered',
          restaurant_id: order.restaurant_id,
          restaurant_name: restaurantName,
          details: {
            manually_fixed: true,
            fixed_at: new Date().toISOString(),
            delivery_assignment_id: deliveryAssignment.id
          }
        });
      }
    }
    
    // 6. Insert missing history entries
    if (missingEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('order_history')
        .insert(missingEntries);
        
      if (insertError) {
        console.error('Failed to insert missing history entries:', insertError);
        return false;
      }
      
      console.log(`Added ${missingEntries.length} missing history entries`);
    }
    
    // 7. Update order status to match delivery status if needed
    if (order.status !== deliveryAssignment.status && 
        ['picked_up', 'on_the_way', 'delivered'].includes(deliveryAssignment.status)) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: deliveryAssignment.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (updateError) {
        console.error('Failed to update order status:', updateError);
        return false;
      }
      
      console.log(`Updated order status from ${order.status} to ${deliveryAssignment.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in manual fix:', error);
    return false;
  }
}

// Export a function that can be run from the browser console
(window as any).fixOrder = manualFixOrderStatus;
