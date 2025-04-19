
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

  if (assignmentCount?.count >= 3) {
    await updateOrderStatus(supabase, orderId, 'assignment_failed');
    return { 
      success: false, 
      error: 'Maximum assignment attempts reached',
      retryAllowed: true
    };
  }

  const nearestRestaurants = await findNearestRestaurants(supabase, latitude, longitude);
  
  if (!nearestRestaurants || nearestRestaurants.length === 0) {
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
  
  const availableRestaurant = nearestRestaurants.find(r => 
    !triedRestaurantIds.includes(r.restaurant_id)
  );

  if (!availableRestaurant) {
    await updateOrderStatus(supabase, orderId, 'no_available_restaurants');
    return { 
      success: false, 
      error: 'No more available restaurants to try',
      retryAllowed: true
    };
  }

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
    assignment_id: assignment.id,
    expires_at: expiresAt,
    attempt_number: (assignmentCount?.count || 0) + 1
  };
}
