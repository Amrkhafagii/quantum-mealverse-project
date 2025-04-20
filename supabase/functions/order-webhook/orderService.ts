
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
  // Get the order data to check for existing restaurant attempt list
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('restaurant_attempts')
    .eq('id', orderId)
    .single();
  
  if (orderError) {
    console.error('Error fetching order data for assignment:', orderError);
  }
  
  // Check if we already have restaurant attempts stored
  let restaurantList = [];
  let currentAttempt = 0;
  
  if (orderData && orderData.restaurant_attempts) {
    try {
      // Use existing restaurant list if available
      const attemptData = JSON.parse(orderData.restaurant_attempts);
      restaurantList = attemptData.restaurants || [];
      currentAttempt = attemptData.current_attempt || 0;
      
      console.log(`Found existing restaurant list with ${restaurantList.length} restaurants, current attempt: ${currentAttempt}`);
    } catch (e) {
      console.error('Error parsing restaurant_attempts data:', e);
    }
  }
  
  // Count actual assignment attempts from history
  const { data: assignmentCount, error: countError } = await supabase
    .from('restaurant_assignment_history')
    .select('id', { count: 'exact' })
    .eq('order_id', orderId);
  
  if (countError) {
    console.error('Error checking assignment count:', countError);
    return { success: false, error: 'Failed to check assignment count' };
  }

  const attemptCount = assignmentCount?.count || 0;
  
  // If we've already tried 3 restaurants or have 3 recorded attempts, fail the order
  if (attemptCount >= 3 || currentAttempt >= 3) {
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

  // If we don't have a restaurant list yet, find the nearest restaurants
  if (restaurantList.length === 0) {
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
    
    // Store the top 3 restaurants (or as many as available)
    restaurantList = nearestRestaurants.slice(0, 3).map(r => ({
      restaurant_id: r.restaurant_id,
      name: r.name,
      distance_km: r.distance_km
    }));
    
    // Store the restaurant list in the order
    const restaurantAttempts = {
      restaurants: restaurantList,
      current_attempt: 0
    };
    
    // Update the order with the restaurant list
    const { error: updateError } = await supabase
      .from('orders')
      .update({ restaurant_attempts: JSON.stringify(restaurantAttempts) })
      .eq('id', orderId);
      
    if (updateError) {
      console.error('Error storing restaurant list:', updateError);
    }
    
    console.log(`Stored ${restaurantList.length} nearby restaurants for sequential assignment`);
  }

  // Get the current restaurant to try from the list
  if (currentAttempt >= restaurantList.length) {
    await updateOrderStatus(supabase, orderId, 'no_available_restaurants');
    return { 
      success: false, 
      error: 'No more available restaurants to try',
      retryAllowed: false
    };
  }

  const currentRestaurant = restaurantList[currentAttempt];
  console.log(`Attempting assignment to restaurant ${currentAttempt + 1} of ${restaurantList.length}: ${currentRestaurant.name}`);

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const assignment = await createRestaurantAssignment(
    supabase, 
    orderId, 
    currentRestaurant.restaurant_id,
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
    currentRestaurant.restaurant_id, 
    'assigned',
    `Assignment expires at ${expiresAt}`
  );

  // Update current attempt in the order
  const restaurantAttempts = {
    restaurants: restaurantList,
    current_attempt: currentAttempt + 1
  };
  
  const { error: updateError } = await supabase
    .from('orders')
    .update({ 
      restaurant_attempts: JSON.stringify(restaurantAttempts),
      status: 'awaiting_restaurant'
    })
    .eq('id', orderId);
    
  if (updateError) {
    console.error('Error updating restaurant attempt counter:', updateError);
  }

  // Prepare the next restaurants for the response
  const nextRestaurants = restaurantList.slice(currentAttempt + 1).map(r => ({
    id: r.restaurant_id,
    name: r.name
  }));

  return { 
    success: true, 
    message: 'Order assigned to restaurant',
    restaurant_id: currentRestaurant.restaurant_id,
    restaurant_name: currentRestaurant.name,
    assignment_id: assignment.id,
    expires_at: expiresAt,
    attempt_number: currentAttempt + 1,
    total_restaurants: restaurantList.length,
    next_restaurants: nextRestaurants
  };
}
