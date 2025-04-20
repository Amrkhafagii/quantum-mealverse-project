
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

export async function handleAssignment(
  supabase: SupabaseClient,
  orderId: string,
  latitude: number,
  longitude: number
) {
  const { data: assignmentCount, error: countError } = await supabase
    .from('restaurant_assignment_history')
    .select('id', { count: 'exact' })
    .eq('order_id', orderId);
  
  if (countError) {
    console.error('Error checking assignment count:', countError);
    return { success: false, error: 'Failed to check assignment count' };
  }

  console.log(`handleAssignment called for order ${orderId} with current assignment attempt count: ${assignmentCount?.count}`);

  if (assignmentCount?.count >= 3) {
    await updateOrderStatus(supabase, orderId, 'assignment_failed');
    
    await logAssignmentAttempt(
      supabase,
      orderId,
      null,
      'cancelled',
      'Order automatically cancelled after 3 failed assignment attempts'
    );
    
    return { 
      success: false, 
      error: 'Maximum assignment attempts reached, order cancelled',
      retryAllowed: false
    };
  }

  console.log(`Looking for restaurants near (${latitude}, ${longitude})`);
  const nearestRestaurants = await findNearestRestaurants(supabase, latitude, longitude);
  
  if (!nearestRestaurants || nearestRestaurants.length === 0) {
    console.log('No restaurants available within range');
    await updateOrderStatus(supabase, orderId, 'no_restaurants_available');
    return { 
      success: false, 
      error: 'No restaurants available within range'
    };
  }

  const { data: previousAttempts } = await supabase
    .from('restaurant_assignment_history')
    .select('restaurant_id')
    .eq('order_id', orderId);
  
  const triedRestaurantIds = previousAttempts?.map(a => a.restaurant_id) || [];
  console.log(`Previously tried restaurants for order ${orderId}:`, triedRestaurantIds);
  
  const availableRestaurant = nearestRestaurants.find(r => 
    !triedRestaurantIds.includes(r.restaurant_id)
  );

  if (!availableRestaurant) {
    console.log('No more available restaurants to try for reassignment');
    await updateOrderStatus(supabase, orderId, 'no_available_restaurants');
    return { 
      success: false, 
      error: 'No more available restaurants to try',
      retryAllowed: true
    };
  }

  console.log(`Assigning to restaurant ID: ${availableRestaurant.restaurant_id} (${availableRestaurant.name}) on attempt #${(assignmentCount?.count || 0) + 1}`);

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const assignment = await createRestaurantAssignment(
    supabase, 
    orderId, 
    availableRestaurant.restaurant_id,
    expiresAt
  );

  if (!assignment) {
    return { 
      success: false, 
      error: 'Failed to create restaurant assignment'
    };
  }

  await logAssignmentAttempt(
    supabase, 
    orderId, 
    availableRestaurant.restaurant_id, 
    'assigned',
    `Assignment expires at ${expiresAt}`
  );

  await updateOrderStatus(supabase, orderId, 'awaiting_restaurant');

  return { 
    success: true, 
    message: 'Order assigned to restaurant',
    restaurant_id: availableRestaurant.restaurant_id,
    restaurant_name: availableRestaurant.name,
    assignment_id: assignment.id,
    expires_at: expiresAt,
    attempt_number: (assignmentCount?.count || 0) + 1
  };
}

