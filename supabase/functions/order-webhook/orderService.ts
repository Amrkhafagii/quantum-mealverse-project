
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
  latitude: number | null = null,
  longitude: number | null = null
) {
  console.log(`Handling assignment for order ${orderId} with location:`, { latitude, longitude });
  
  // Count previous attempts for this order
  const { data: assignmentCount, error: countError } = await supabase
    .from('restaurant_assignment_history')
    .select('id', { count: 'exact' })
    .eq('order_id', orderId);
  
  if (countError) {
    console.error('Error checking assignment count:', countError);
    return { success: false, error: 'Failed to check assignment count' };
  }
  
  const attemptCount = assignmentCount?.count || 0;
  console.log(`Previous assignment attempts for order ${orderId}: ${attemptCount}`);

  // Check if we've hit the maximum attempts (3)
  if (attemptCount >= 3) {
    console.log(`Maximum assignment attempts (3) reached for order ${orderId}, cancelling order`);
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

  // If latitude/longitude are not provided, try to get them from the order
  if (latitude === null || longitude === null) {
    console.log('No location provided, attempting to retrieve from order');
    const { data: orderData } = await supabase
      .from('orders')
      .select('latitude, longitude')
      .eq('id', orderId)
      .single();
    
    if (orderData?.latitude && orderData?.longitude) {
      latitude = orderData.latitude;
      longitude = orderData.longitude;
      console.log(`Retrieved location from order: (${latitude}, ${longitude})`);
    } else {
      console.warn('Could not find location data in order');
    }
  }
  
  // If we still don't have coords, use a default location or fail
  if (latitude === null || longitude === null) {
    console.error('No location data available for order assignment');
    await updateOrderStatus(supabase, orderId, 'no_location_data');
    return { 
      success: false, 
      error: 'No location data available for restaurant assignment' 
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

  // Get the list of restaurants we've already tried
  const { data: previousAttempts } = await supabase
    .from('restaurant_assignment_history')
    .select('restaurant_id')
    .eq('order_id', orderId);
  
  const triedRestaurantIds = previousAttempts?.map(a => a.restaurant_id) || [];
  console.log(`Previously tried restaurants: ${triedRestaurantIds.length > 0 ? triedRestaurantIds.join(', ') : 'none'}`);
  
  // Find a restaurant we haven't tried yet
  const availableRestaurant = nearestRestaurants.find(r => 
    !triedRestaurantIds.includes(r.restaurant_id)
  );

  if (!availableRestaurant) {
    console.log('No more available restaurants to try');
    await updateOrderStatus(supabase, orderId, 'no_available_restaurants');
    return { 
      success: false, 
      error: 'No more available restaurants to try',
      retryAllowed: true
    };
  }

  console.log(`Assigning order to restaurant: ${availableRestaurant.restaurant_id} (${availableRestaurant.restaurant_name})`);
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
    restaurant_name: availableRestaurant.restaurant_name,
    assignment_id: assignment.id,
    expires_at: expiresAt,
    attempt_number: attemptCount + 1
  };
}
