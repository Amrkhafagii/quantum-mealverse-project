
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
    await updateOrderStatus(supabase, orderId, 'no_restaurants_available');
    
    // Log to webhook_logs
    await supabase.from('webhook_logs').insert({
      payload: {
        order_id: orderId,
        status: 'failed',
        reason: 'No restaurants available within range'
      }
    });
    
    return { 
      success: false, 
      error: 'No restaurants available within range',
      status: 'no_restaurants_available'
    };
  }

  console.log(`[ASSIGN_ALL] Found ${nearestRestaurants.length} restaurants for order ${orderId}`);

  // Set expiration time for 5 minutes from now
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  
  const assignments = [];
  const restaurantNames = [];

  // Create assignments for all restaurants
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
    console.log('[ASSIGN_ALL] Failed to create any restaurant assignments');
    
    // Log to webhook_logs
    await supabase.from('webhook_logs').insert({
      payload: {
        order_id: orderId,
        status: 'error',
        reason: 'Failed to create assignments'
      }
    });
    
    return { 
      success: false, 
      error: 'Failed to create restaurant assignments'
    };
  }

  // Log to webhook_logs
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

  // Return success with information about these assignments
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
  latitude: number,
  longitude: number
) {
  // Get the current assignment attempt count
  const { data: assignmentCount, error: countError } = await supabase
    .from('restaurant_assignment_history')
    .select('id', { count: 'exact' })
    .eq('order_id', orderId);
  
  if (countError) {
    console.error('Error checking assignment count:', countError);
    return { success: false, error: 'Failed to check assignment count' };
  }

  const currentAttemptNumber = (assignmentCount?.count || 0) + 1;
  console.log(`[REASSIGNMENT DEBUG] Order ${orderId} - Processing attempt #${currentAttemptNumber}`);

  // Check if we've reached the maximum number of attempts (3)
  if (currentAttemptNumber > 3) {
    console.log(`[REASSIGNMENT DEBUG] Order ${orderId} - Maximum attempts (3) reached, marking as assignment_failed`);
    await updateOrderStatus(supabase, orderId, 'assignment_failed');
    
    await logAssignmentAttempt(
      supabase,
      orderId,
      null,
      'failed',
      'Order automatically failed assignment after 3 attempts with no response from restaurants'
    );
    
    // Log to webhook_logs table for tracking
    await supabase.from('webhook_logs').insert({
      payload: {
        order_id: orderId,
        attempt_number: currentAttemptNumber,
        status: 'assignment_failed',
        reason: 'Maximum assignment attempts reached with no responses'
      }
    });
    
    return { 
      success: false, 
      error: 'Maximum assignment attempts reached, no response from restaurants, order marked as assignment_failed',
      retryAllowed: false,
      status: 'assignment_failed'
    };
  }

  // First, check if there are any pending assignments for this order that haven't expired yet
  const { data: pendingAssignments } = await supabase
    .from('restaurant_assignments')
    .select('id, restaurant_id, expires_at')
    .eq('order_id', orderId)
    .eq('status', 'pending');
  
  // If there's a non-expired pending assignment, don't create a new one
  const now = new Date();
  const validAssignment = pendingAssignments?.find(a => new Date(a.expires_at) > now);
  
  if (validAssignment) {
    console.log(`[REASSIGNMENT DEBUG] Order ${orderId} already has a valid pending assignment. Skipping reassignment.`);
    return {
      success: false,
      error: 'Order already has an active assignment',
      retryAllowed: false
    };
  }

  // If there are expired assignments, update their status
  const expiredAssignments = pendingAssignments?.filter(a => new Date(a.expires_at) <= now) || [];
  
  for (const assignment of expiredAssignments) {
    console.log(`[REASSIGNMENT DEBUG] Marking expired assignment ${assignment.id} as 'expired'`);
    await supabase
      .from('restaurant_assignments')
      .update({ status: 'expired' })
      .eq('id', assignment.id);
      
    await logAssignmentAttempt(
      supabase,
      orderId,
      assignment.restaurant_id,
      'expired',
      'Restaurant did not respond within the time limit'
    );
  }

  console.log(`[REASSIGNMENT DEBUG] Looking for restaurants near (${latitude}, ${longitude})`);
  const nearestRestaurants = await findNearestRestaurants(supabase, latitude, longitude);
  
  if (!nearestRestaurants || nearestRestaurants.length === 0) {
    console.log('[REASSIGNMENT DEBUG] No restaurants available within range');
    await updateOrderStatus(supabase, orderId, 'no_restaurants_available');
    
    // Log to webhook_logs
    await supabase.from('webhook_logs').insert({
      payload: {
        order_id: orderId,
        attempt_number: currentAttemptNumber,
        status: 'failed',
        reason: 'No restaurants available within range'
      }
    });
    
    return { 
      success: false, 
      error: 'No restaurants available within range'
    };
  }

  console.log(`[REASSIGNMENT DEBUG] Found ${nearestRestaurants.length} potential restaurants for order ${orderId}`);

  // Get previously tried restaurants for this order
  const { data: previousAttempts } = await supabase
    .from('restaurant_assignment_history')
    .select('restaurant_id, status, created_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });
  
  const triedRestaurantIds = previousAttempts?.map(a => a.restaurant_id) || [];
  console.log(`[REASSIGNMENT DEBUG] Order ${orderId} - Previously tried restaurants:`, triedRestaurantIds);
  
  // Debug which restaurants have been tried and their outcomes
  if (previousAttempts && previousAttempts.length > 0) {
    previousAttempts.forEach((attempt, index) => {
      console.log(`[REASSIGNMENT DEBUG] Previous attempt #${index + 1} - Restaurant: ${attempt.restaurant_id}, Status: ${attempt.status}, Time: ${attempt.created_at}`);
    });
  }
  
  // Find the next available restaurant that hasn't been tried yet
  const availableRestaurant = nearestRestaurants.find(r => 
    !triedRestaurantIds.includes(r.restaurant_id)
  );

  if (!availableRestaurant) {
    console.log('[REASSIGNMENT DEBUG] No more available restaurants to try for reassignment');
    await updateOrderStatus(supabase, orderId, 'no_available_restaurants');
    
    await logAssignmentAttempt(
      supabase,
      orderId,
      null,
      'failed',
      'All nearby restaurants have been exhausted with no acceptance'
    );
    
    // Log to webhook_logs
    await supabase.from('webhook_logs').insert({
      payload: {
        order_id: orderId,
        attempt_number: currentAttemptNumber,
        status: 'no_available_restaurants',
        reason: 'No more available restaurants to try'
      }
    });
    
    return { 
      success: false, 
      error: 'No more available restaurants to try',
      retryAllowed: false,
      status: 'no_available_restaurants'
    };
  }

  console.log(`[REASSIGNMENT DEBUG] Assigning order ${orderId} to restaurant ID: ${availableRestaurant.restaurant_id} (${availableRestaurant.name}) on attempt #${currentAttemptNumber}`);

  // Set expiration time for 5 minutes from now
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // Create a new restaurant assignment
  const assignment = await createRestaurantAssignment(
    supabase, 
    orderId, 
    availableRestaurant.restaurant_id,
    expiresAt
  );

  if (!assignment) {
    console.log('[REASSIGNMENT DEBUG] Failed to create restaurant assignment');
    
    // Log to webhook_logs
    await supabase.from('webhook_logs').insert({
      payload: {
        order_id: orderId,
        attempt_number: currentAttemptNumber,
        restaurant_id: availableRestaurant.restaurant_id,
        status: 'error',
        reason: 'Failed to create assignment'
      }
    });
    
    return { 
      success: false, 
      error: 'Failed to create restaurant assignment'
    };
  }

  // Log this assignment attempt to the history
  await logAssignmentAttempt(
    supabase, 
    orderId, 
    availableRestaurant.restaurant_id, 
    'assigned',
    `Attempt #${currentAttemptNumber}: Assignment expires at ${expiresAt}`
  );
  
  // Log to webhook_logs
  await supabase.from('webhook_logs').insert({
    payload: {
      order_id: orderId,
      attempt_number: currentAttemptNumber,
      restaurant_id: availableRestaurant.restaurant_id,
      restaurant_name: availableRestaurant.name,
      status: currentAttemptNumber === 1 ? 'assigned' : 'reassigned',
      expires_at: expiresAt
    },
    restaurant_assigned: availableRestaurant.restaurant_id
  });

  await updateOrderStatus(supabase, orderId, 'awaiting_restaurant');

  // Return success with detailed information about this assignment
  return { 
    success: true, 
    message: currentAttemptNumber === 1 ? 'Order assigned to restaurant' : `Order reassigned to restaurant (attempt #${currentAttemptNumber})`,
    restaurant_id: availableRestaurant.restaurant_id,
    restaurant_name: availableRestaurant.name,
    assignment_id: assignment.id,
    expires_at: expiresAt,
    attempt_number: currentAttemptNumber
  };
}

export async function duplicateOrderWithNewRestaurant(
  supabase: any,
  originalOrderId: string,
  latitude: number,
  longitude: number
) {
  // Fetch the original order data
  const { data: originalOrder, error: fetchOrderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', originalOrderId)
    .single();

  if (fetchOrderError || !originalOrder) {
    console.error('[DUPLICATE ORDER] Failed to fetch original order:', fetchOrderError);
    return { success: false, error: 'Failed to fetch original order' };
  }

  // Find nearest restaurants
  const nearestRestaurants = await findNearestRestaurants(supabase, latitude, longitude);
  if (!nearestRestaurants || nearestRestaurants.length === 0) {
    return { success: false, error: 'No available restaurants' };
  }

  // Find previously tried restaurant IDs
  const { data: previousAttempts } = await supabase
    .from('restaurant_assignment_history')
    .select('restaurant_id')
    .eq('order_id', originalOrderId);

  const triedRestaurantIds = previousAttempts?.map(a => a.restaurant_id) || [];

  // Find a restaurant not tried before
  const availableRestaurant = nearestRestaurants.find(r =>
    !triedRestaurantIds.includes(r.restaurant_id)
  );

  if (!availableRestaurant) {
    return { success: false, error: 'No untried restaurants available' };
  }

  // Prepare new order data (duplicate order except for possibly unique fields)
  const newOrderData = { ...originalOrder };
  delete newOrderData.id;
  delete newOrderData.created_at;
  delete newOrderData.updated_at;
  newOrderData.status = 'pending';
  newOrderData.restaurant_id = availableRestaurant.restaurant_id || null;

  // Insert new order
  const { data: newOrder, error: insertError } = await supabase
    .from('orders')
    .insert(newOrderData)
    .select('*')
    .single();

  if (insertError || !newOrder) {
    console.error('[DUPLICATE ORDER] Failed to create new order:', insertError);
    return { success: false, error: 'Failed to create new order' };
  }

  // Duplicate order_items
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', originalOrderId);

  if (orderItems && orderItems.length > 0) {
    const newItems = orderItems.map(item => ({
      ...item,
      order_id: newOrder.id,
      id: undefined // Let DB create a new ID
    }));
    await supabase
      .from('order_items')
      .insert(newItems.map(i => {
        const { id, ...rest } = i;
        return rest;
      }));
  }

  // Assign to the new restaurant
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const assignment = await createRestaurantAssignment(
    supabase, 
    newOrder.id, 
    availableRestaurant.restaurant_id,
    expiresAt
  );

  if (!assignment) {
    return { success: false, error: 'Failed to create restaurant assignment for new order' };
  }

  // Log the duplication
  await logAssignmentAttempt(
    supabase,
    newOrder.id,
    availableRestaurant.restaurant_id,
    'duplicated_assignment',
    `Order duplicated from ${originalOrderId} after expiration/rejection`
  );

  // Optionally update the original order's status to reflect that it was branched
  await updateOrderStatus(supabase, originalOrderId, 'branched_to_new_order');

  return { 
    success: true,
    message: 'New order created for another restaurant',
    new_order_id: newOrder.id,
    new_assignment_id: assignment.id,
    restaurant_id: availableRestaurant.restaurant_id,
    restaurant_name: availableRestaurant.name,
    expires_at: expiresAt
  };
}
