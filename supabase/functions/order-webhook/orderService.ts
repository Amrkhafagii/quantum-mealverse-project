
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
    console.log(`[REASSIGNMENT DEBUG] Order ${orderId} - Maximum attempts (3) reached, marking as failed`);
    await updateOrderStatus(supabase, orderId, 'assignment_failed');
    
    await logAssignmentAttempt(
      supabase,
      orderId,
      null,
      'cancelled',
      'Order automatically cancelled after 3 failed assignment attempts'
    );
    
    // Log details to webhook_logs table for tracking
    await supabase.from('webhook_logs').insert({
      payload: {
        order_id: orderId,
        attempt_number: currentAttemptNumber,
        status: 'failed',
        reason: 'Maximum assignment attempts reached'
      }
    });
    
    return { 
      success: false, 
      error: 'Maximum assignment attempts reached, order cancelled',
      retryAllowed: false
    };
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
    
    // Log to webhook_logs
    await supabase.from('webhook_logs').insert({
      payload: {
        order_id: orderId,
        attempt_number: currentAttemptNumber,
        status: 'failed',
        reason: 'No more available restaurants to try'
      }
    });
    
    return { 
      success: false, 
      error: 'No more available restaurants to try',
      retryAllowed: true
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
