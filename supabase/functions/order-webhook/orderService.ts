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
    
    // Record in order_history
    await supabase.from('order_history').insert({
      order_id: orderId,
      status: 'no_restaurant_available',
      details: { reason: 'No restaurants available within range' }
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
      
      // Record each assignment in order_history
      await supabase.from('order_history').insert({
        order_id: orderId,
        status: 'restaurant_assigned',
        restaurant_id: restaurant.restaurant_id,
        restaurant_name: restaurant.restaurant_name,
        details: { assignment_id: assignment.id, expires_at: expiresAt },
      });
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
    
    // Record failure in order_history
    await supabase.from('order_history').insert({
      order_id: orderId,
      status: 'assignment_error',
      details: { reason: 'Failed to create restaurant assignments' }
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
  
  // Record in order_history that assignments were created
  await supabase.from('order_history').insert({
    order_id: orderId,
    status: 'assignments_created',
    details: { 
      assignment_count: assignments.length,
      restaurant_names: restaurantNames,
      expires_at: expiresAt
    }
  });
  
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
    
    await supabase
      .from('restaurant_assignments')
      .update({ status: 'expired' })
      .eq('id', assignmentId);
      
    await logAssignmentAttempt(supabase, orderId, restaurantId, 'expired');
    
    // Record in order_history
    await supabase.from('order_history').insert({
      order_id: orderId,
      status: 'assignment_expired',
      restaurant_id: restaurantId,
      details: { assignment_id: assignmentId }
    });
    
    return { 
      success: false, 
      error: 'Assignment has expired' 
    };
  }

  if (action === 'accept') {
    const { error: updateError } = await supabase
      .from('restaurant_assignments')
      .update({ status: 'accepted' })
      .eq('id', assignmentId);
    
    if (updateError) {
      console.error('[HANDLE_ASSIGNMENT] Error updating assignment:', updateError);
      return { success: false, error: 'Failed to update assignment' };
    }
    
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
    
    // Record in order_history
    await supabase.from('order_history').insert({
      order_id: orderId,
      status: 'restaurant_accepted',
      restaurant_id: restaurantId,
      details: { assignment_id: assignmentId }
    });
    
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
    const { error: updateError } = await supabase
      .from('restaurant_assignments')
      .update({ status: 'rejected' })
      .eq('id', assignmentId);
    
    if (updateError) {
      console.error('[HANDLE_ASSIGNMENT] Error updating assignment:', updateError);
      return { success: false, error: 'Failed to update assignment' };
    }
    
    await logAssignmentAttempt(supabase, orderId, restaurantId, 'rejected');
    
    // Record in order_history
    await supabase.from('order_history').insert({
      order_id: orderId,
      status: 'restaurant_rejected',
      restaurant_id: restaurantId,
      details: { assignment_id: assignmentId }
    });
    
    const { data: pendingAssignments } = await supabase
      .from('restaurant_assignments')
      .select('id')
      .eq('order_id', order_id)
      .eq('status', 'pending');
    
    if (!pendingAssignments || pendingAssignments.length === 0) {
      await updateOrderStatus(supabase, orderId, 'no_restaurant_accepted');
      
      // Record in order_history
      await supabase.from('order_history').insert({
        order_id: orderId,
        status: 'no_restaurant_accepted',
        details: { reason: 'All restaurants have rejected the order' }
      });
      
      return { 
        success: true, 
        message: 'Order rejected by restaurant, no more pending assignments',
        result: {
          status: 'no_restaurant_accepted',
          message: 'All restaurants have rejected the order'
        }
      };
    }
    
    return { 
      success: true, 
      message: 'Order rejected by restaurant, but still awaiting responses from other restaurants',
      pending_assignments: pendingAssignments.length
    };
  }
}

export async function checkAndHandleExpiredAssignments(supabase: SupabaseClient) {
  console.log('[CHECK_EXPIRED] Starting expired assignments check');
  const now = new Date().toISOString();
  
  try {
    // Find assignments that have expired but still have pending status
    const { data: expiredAssignments, error: expiredError } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, order_id, expires_at')
      .eq('status', 'pending')
      .lt('expires_at', now);
    
    if (expiredError) {
      console.error('[CHECK_EXPIRED] Error fetching expired assignments:', expiredError);
      return { success: false, error: 'Failed to fetch expired assignments' };
    }
    
    console.log(`[CHECK_EXPIRED] Found ${expiredAssignments?.length || 0} expired assignments`);
    
    if (!expiredAssignments || expiredAssignments.length === 0) {
      return { success: true, message: 'No expired assignments found' };
    }
    
    const results = [];
    const affectedOrders = new Set();
    
    for (const assignment of expiredAssignments) {
      console.log(`[CHECK_EXPIRED] Processing expired assignment ${assignment.id} for order ${assignment.order_id}`);
      
      try {
        // Mark the assignment as expired
        const { error: updateError } = await supabase
          .from('restaurant_assignments')
          .update({ status: 'expired' })
          .eq('id', assignment.id);
        
        if (updateError) {
          console.error(`[CHECK_EXPIRED] Error updating assignment ${assignment.id}:`, updateError);
          results.push({ 
            assignment_id: assignment.id, 
            success: false, 
            error: 'Failed to update assignment status' 
          });
          continue;
        }
        
        // Add to restaurant_assignment_history table - this was missing
        await supabase
          .from('restaurant_assignment_history')
          .insert({
            order_id: assignment.order_id,
            restaurant_id: assignment.restaurant_id,
            status: 'expired',
            notes: `Automatically expired at ${now}`
          });
        
        // Add to order_history
        await supabase
          .from('order_history')
          .insert({
            order_id: assignment.order_id,
            status: 'assignment_expired',
            restaurant_id: assignment.restaurant_id,
            details: { assignment_id: assignment.id },
            expired_at: now
          });
        
        affectedOrders.add(assignment.order_id);
        
        results.push({ 
          assignment_id: assignment.id, 
          success: true, 
          message: 'Assignment marked as expired' 
        });
      } catch (error) {
        console.error(`[CHECK_EXPIRED] Exception processing assignment ${assignment.id}:`, error);
        results.push({ 
          assignment_id: assignment.id, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    // Process affected orders
    for (const orderId of affectedOrders) {
      try {
        // Check if there are any pending assignments left
        const { data: pendingAssignments, error: pendingError } = await supabase
          .from('restaurant_assignments')
          .select('id')
          .eq('order_id', orderId)
          .eq('status', 'pending');
          
        if (pendingError) {
          console.error(`[CHECK_EXPIRED] Error checking pending assignments for order ${orderId}:`, pendingError);
          continue;
        }
        
        // Check if there's an accepted assignment
        const { data: acceptedAssignments, error: acceptedError } = await supabase
          .from('restaurant_assignments')
          .select('id')
          .eq('order_id', orderId)
          .eq('status', 'accepted');
          
        if (acceptedError) {
          console.error(`[CHECK_EXPIRED] Error checking accepted assignments for order ${orderId}:`, acceptedError);
          continue;
        }
        
        // If no pending or accepted assignments remain, update order status
        if ((!pendingAssignments || pendingAssignments.length === 0) &&
            (!acceptedAssignments || acceptedAssignments.length === 0)) {
          
          console.log(`[CHECK_EXPIRED] All assignments expired for order ${orderId}, updating status`);
          
          // Update order status
          await updateOrderStatus(supabase, orderId, 'no_restaurant_accepted');
          
          // Add to order history
          await supabase
            .from('order_history')
            .insert({
              order_id: orderId,
              status: 'no_restaurant_accepted',
              details: { reason: 'All restaurant assignments expired' }
            });
        }
      } catch (error) {
        console.error(`[CHECK_EXPIRED] Error processing order ${orderId}:`, error);
      }
    }
    
    return { 
      success: true, 
      processed: results.length,
      results,
      affected_orders: affectedOrders.size
    };
  } catch (error) {
    console.error('[CHECK_EXPIRED] Error in checkAndHandleExpiredAssignments:', error);
    return { success: false, error: 'Failed to process expired assignments' };
  }
}
