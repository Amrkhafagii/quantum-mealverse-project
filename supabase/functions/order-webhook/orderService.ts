
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

