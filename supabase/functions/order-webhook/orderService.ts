import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { findNearestRestaurants, createRestaurantAssignment, logAssignmentAttempt } from './restaurantService.ts';

export async function updateOrderStatus(
  supabase: SupabaseClient,
  orderId: string,
  status: string
) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating order ${orderId} status to ${status}:`, error);
    return null;
  }

  return data;
}

export async function assignOrderToAllNearbyRestaurants(
  supabase: SupabaseClient,
  orderId: string,
  latitude: number,
  longitude: number
) {
  console.log(`[ASSIGN_ALL] Looking for restaurants near (${latitude}, ${longitude})`);
  const nearestRestaurants = await findNearestRestaurants(supabase, latitude, longitude);
  
  if (!nearestRestaurants || nearestRestaurants.length === 0) {
    console.log('[ASSIGN_ALL] No restaurants available within range');
    await updateOrderStatus(supabase, orderId, 'no_restaurant_accepted');
    await supabase.from('webhook_logs').insert({
      payload: {
        order_id: orderId,
        status: 'no_restaurant_accepted',
        reason: 'No restaurants available within range'
      }
    });
    return { 
      success: false, 
      error: 'No restaurants available within range',
      status: 'no_restaurant_accepted'
    };
  }

  console.log(`[ASSIGN_ALL] Found ${nearestRestaurants.length} restaurants`);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const assignments = [];
  const restaurantNames = [];

  for (const restaurant of nearestRestaurants) {
    const assignment = await createRestaurantAssignment(
      supabase, 
      orderId, 
      restaurant.restaurant_id,
      expiresAt
    );
    if (assignment) {
      assignments.push(assignment);
      restaurantNames.push(restaurant.restaurant_name || 'Restaurant');
      await logAssignmentAttempt(
        supabase, 
        orderId, 
        restaurant.restaurant_id, 
        'assigned',
        `Assignment expires at ${expiresAt}`
      );
    }
  }

  if (assignments.length === 0) {
    await updateOrderStatus(supabase, orderId, 'no_restaurant_accepted');
    await supabase.from('webhook_logs').insert({
      payload: {
        order_id: orderId,
        status: 'error',
        reason: 'Failed to create assignments'
      }
    });
    return { 
      success: false, 
      error: 'Failed to create restaurant assignments',
      status: 'no_restaurant_accepted'
    };
  }

  await supabase.from('webhook_logs').insert({
    payload: {
      order_id: orderId,
      status: 'assigned_to_multiple',
      assignment_count: assignments.length,
      restaurants: restaurantNames,
      expires_at: expiresAt
    }
  });

  await updateOrderStatus(supabase, orderId, 'awaiting_restaurant');
  return { 
    success: true, 
    message: `Order assigned to ${assignments.length} restaurants`,
    assignment_count: assignments.length,
    restaurant_names: restaurantNames,
    expires_at: expiresAt
  };
}

export async function handleAssignment(
  supabase: SupabaseClient,
  orderId: string,
  restaurantId: string,
  assignmentId: string,
  action: 'accept' | 'reject'
) {
  // Verify the assignment exists and is still pending
  const { data: assignment, error: assignmentError } = await supabase
    .from('restaurant_assignments')
    .select('*')
    .eq('id', assignmentId)
    .eq('order_id', orderId)
    .eq('restaurant_id', restaurantId)
    .eq('status', 'pending')
    .single();
  
  if (assignmentError || !assignment) {
    console.log('[HANDLE_ASSIGNMENT] Invalid or expired assignment');
    return { 
      success: false, 
      error: 'Invalid or expired assignment' 
    };
  }

  if (new Date(assignment.expires_at) < new Date()) {
    console.log('[HANDLE_ASSIGNMENT] Assignment has expired');
    
    // Update assignment status to expired
    await supabase
      .from('restaurant_assignments')
      .update({ status: 'expired' })
      .eq('id', assignmentId);
      
    await logAssignmentAttempt(supabase, orderId, restaurantId, 'expired');
    
    return { 
      success: false, 
      error: 'Assignment has expired' 
    };
  }

  if (action === 'accept') {
    // Mark this assignment as accepted
    const { error: updateError } = await supabase
      .from('restaurant_assignments')
      .update({ status: 'accepted' })
      .eq('id', assignmentId);
    
    if (updateError) {
      console.error('[HANDLE_ASSIGNMENT] Error updating assignment:', updateError);
      return { success: false, error: 'Failed to update assignment' };
    }
    
    // Mark all other pending assignments as cancelled
    const { error: cancelError } = await supabase
      .from('restaurant_assignments')
      .update({ status: 'cancelled' })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .neq('id', assignmentId);
    
    if (cancelError) {
      console.error('[HANDLE_ASSIGNMENT] Error cancelling other assignments:', cancelError);
    }
    
    await logAssignmentAttempt(supabase, orderId, restaurantId, 'accepted');
    
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ 
        status: 'processing', 
        restaurant_id: restaurantId 
      })
      .eq('id', orderId);
    
    if (orderUpdateError) {
      console.error('[HANDLE_ASSIGNMENT] Error updating order after acceptance:', orderUpdateError);
      return { success: false, error: 'Failed to update order' };
    }
    
    return { 
      success: true, 
      message: 'Order accepted successfully',
      order_id: orderId,
      restaurant_id: restaurantId
    };
  } else { // action === 'reject'
    // Mark this assignment as rejected
    const { error: updateError } = await supabase
      .from('restaurant_assignments')
      .update({ status: 'rejected' })
      .eq('id', assignmentId);
    
    if (updateError) {
      console.error('[HANDLE_ASSIGNMENT] Error updating assignment:', updateError);
      return { success: false, error: 'Failed to update assignment' };
    }
    
    await logAssignmentAttempt(supabase, orderId, restaurantId, 'rejected');
    
    // If no pending assignments remain, update to no_restaurant_accepted
    const { data: pendingAssignments } = await supabase
      .from('restaurant_assignments')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'pending');
    
    if (!pendingAssignments || pendingAssignments.length === 0) {
      await updateOrderStatus(supabase, orderId, 'no_restaurant_accepted');
      return { 
        success: true, 
        message: 'Order rejected by restaurant, no more pending assignments',
        result: {
          status: 'no_restaurant_accepted',
          message: 'All restaurants have rejected the order'
        }
      };
    }
    
    // There are still pending assignments, do nothing
    return { 
      success: true, 
      message: 'Order rejected by restaurant, but still awaiting responses from other restaurants',
      pending_assignments: pendingAssignments.length
    };
  }
}

export async function duplicateOrderWithNewRestaurant(
  supabase: SupabaseClient,
  orderId: string,
  restaurantId: string
) {
  // Implementation for duplicating an order with a new restaurant
  console.log(`Duplicating order ${orderId} for restaurant ${restaurantId}`);

  try {
    // Fetch the original order
    const { data: originalOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !originalOrder) {
      console.error('Error fetching original order:', fetchError);
      return { success: false, error: 'Failed to fetch original order' };
    }

    // Fetch the order items from the original order
    const { data: orderItems, error: fetchItemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (fetchItemsError) {
      console.error('Error fetching order items:', fetchItemsError);
      return { success: false, error: 'Failed to fetch order items' };
    }

    // Prepare the new order data
    const newOrderData = {
      ...originalOrder,
      restaurant_id: restaurantId,
      status: 'pending', // Set the new order status to pending
      id: undefined, // Let Supabase generate a new UUID
      created_at: undefined, // Let Supabase handle the timestamp
      updated_at: undefined, // Let Supabase handle the timestamp
    };

    // Insert the new order
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert([newOrderData])
      .select('id')
      .single();

    if (insertError || !newOrder) {
      console.error('Error inserting new order:', insertError);
      return { success: false, error: 'Failed to insert new order' };
    }

    // Prepare the new order items
    const newOrderItems = orderItems.map(item => ({
      ...item,
      order_id: newOrder.id,
      id: undefined, // Let Supabase generate a new UUID
      created_at: undefined, // Let Supabase handle the timestamp
    }));

    // Insert the new order items
    const { error: insertItemsError } = await supabase
      .from('order_items')
      .insert(newOrderItems);

    if (insertItemsError) {
      console.error('Error inserting new order items:', insertItemsError);
      return { success: false, error: 'Failed to insert new order items' };
    }

    return {
      success: true,
      message: `Order ${orderId} duplicated for restaurant ${restaurantId} with new order ID ${newOrder.id}`,
      new_order_id: newOrder.id,
    };
  } catch (error) {
    console.error('Unexpected error in duplicateOrderWithNewRestaurant:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}
