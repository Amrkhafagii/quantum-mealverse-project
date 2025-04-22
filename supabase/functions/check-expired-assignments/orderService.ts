
export async function logOrderExpiration(supabase: any, orderId: string, restaurantId: string, assignmentId: string, now: string) {
  // Use the valid status 'expired_assignment' instead of 'assignment_expired'
  const { error: orderHistoryError } = await supabase
    .from('order_history')
    .insert({
      order_id: orderId,
      status: 'expired_assignment',
      restaurant_id: restaurantId,
      restaurant_name: null, // Add null restaurant_name to avoid constraints
      details: { assignment_id: assignmentId },
      expired_at: now
    });

  if (orderHistoryError) {
    console.error('Error logging order expiration to history:', orderHistoryError);
    throw orderHistoryError;
  }
}

export async function updateOrderStatus(supabase: any, orderId: string) {
  console.log(`Updating order ${orderId} to status 'no_restaurant_accepted'`);
  
  try {
    // Get current order status for history record
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (fetchError) {
      console.error('Error fetching current order:', fetchError);
      throw fetchError;
    }

    // Update order status
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ status: 'no_restaurant_accepted' })
      .eq('id', orderId);

    if (orderUpdateError) {
      console.error('Error updating order status:', orderUpdateError);
      throw orderUpdateError;
    }

    // Log status change in order history
    const { error: historyError } = await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        status: 'no_restaurant_accepted',
        previous_status: currentOrder?.status,
        restaurant_id: null, // Use null to avoid constraints
        restaurant_name: null, // Use null to avoid constraints
        details: { reason: 'All restaurant assignments expired' }
      });

    if (historyError) {
      console.error('Error inserting into order history:', historyError);
      throw historyError;
    }

    console.log(`Successfully updated order ${orderId} status and history records`);
    return true;
  } catch (error) {
    console.error(`Failed to update order ${orderId} status:`, error);
    throw error;
  }
}
