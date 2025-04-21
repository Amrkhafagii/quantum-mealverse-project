
export async function logOrderExpiration(supabase: any, orderId: string, restaurantId: string, assignmentId: string, now: string) {
  const { error: orderHistoryError } = await supabase
    .from('order_history')
    .insert({
      order_id: orderId,
      status: 'assignment_expired',
      restaurant_id: restaurantId,
      details: { assignment_id: assignmentId },
      expired_at: now
    });

  if (orderHistoryError) throw orderHistoryError;
}

export async function updateOrderStatus(supabase: any, orderId: string) {
  // Update order status
  const { error: orderUpdateError } = await supabase
    .from('orders')
    .update({ status: 'no_restaurant_accepted' })
    .eq('id', orderId);

  if (orderUpdateError) throw orderUpdateError;

  // Log status change in order history
  const { error: historyError } = await supabase
    .from('order_history')
    .insert({
      order_id: orderId,
      status: 'no_restaurant_accepted',
      details: { reason: 'All restaurant assignments expired' }
    });

  if (historyError) throw historyError;

  // Add to order status history
  const { data: currentOrder } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();

  const { error: statusHistoryError } = await supabase
    .from('order_status_history')
    .insert({
      order_id: orderId,
      previous_status: currentOrder?.status,
      new_status: 'no_restaurant_accepted'
    });

  if (statusHistoryError) throw statusHistoryError;
}
