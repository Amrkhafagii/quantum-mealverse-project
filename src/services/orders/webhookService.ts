
import { supabase } from '@/integrations/supabase/client';
import { AssignmentStatus, OrderAssignmentRequest, RestaurantResponseRequest, WebhookResponse } from '@/types/webhook';

// Function URL
const WEBHOOK_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://hozgutjvbrljeijybnyg.supabase.co/functions/v1';

/**
 * Sends an order to the webhook for restaurant assignment
 */
export const sendOrderToWebhook = async (
  orderId: string,
  latitude: number,
  longitude: number,
  expiredReassignment = false
): Promise<WebhookResponse> => {
  try {
    const requestBody: OrderAssignmentRequest = {
      order_id: orderId,
      latitude: latitude,
      longitude: longitude,
      action: 'assign',
      expired_reassignment: expiredReassignment
    };

    const response = await fetch(`${WEBHOOK_URL}/order-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Webhook request failed:', errorData);
      return { success: false, error: errorData.error || 'Webhook request failed' };
    }

    const responseData: WebhookResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error sending order to webhook:', error);
    return { success: false, error: 'Failed to send order to webhook' };
  }
};

/**
 * Records an entry in the order history table
 */
export const recordOrderHistory = async (
  orderId: string,
  status: string,
  restaurantId?: string,
  details?: any,
  expiredAt?: string
): Promise<void> => {
  try {
    // Get restaurant name if restaurantId is provided
    let restaurantName;
    if (restaurantId) {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();
      
      restaurantName = restaurant?.name;
    }

    // Insert record into order_history table
    await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        status,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        details,
        expired_at: expiredAt
      });
      
    console.log(`Order history recorded for ${orderId}, status: ${status}`);
  } catch (error) {
    console.error('Error recording order history:', error);
  }
};

/**
 * Checks the current status of an order's restaurant assignments
 * and automatically handles expired assignments
 */
export const checkAssignmentStatus = async (orderId: string): Promise<AssignmentStatus | null> => {
  try {
    // Check for any expired assignments that need to be handled
    const now = new Date().toISOString();
    
    // Find assignments that have expired but still have pending status
    const { data: expiredAssignments } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .lt('expires_at', now);
    
    // If we found expired assignments, mark them as expired
    if (expiredAssignments && expiredAssignments.length > 0) {
      console.log(`Marking ${expiredAssignments.length} expired assignments for order ${orderId}`);
      
      // Update all expired assignments
      await supabase
        .from('restaurant_assignments')
        .update({ status: 'expired' })
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .lt('expires_at', now);
      
      // Add entries to the assignment history for the status changes with timed_out status
      for (const assignment of expiredAssignments) {
        await supabase
          .from('restaurant_assignment_history')
          .insert({
            order_id: orderId,
            restaurant_id: assignment.restaurant_id,
            status: 'timed_out',
            notes: 'Timer expired'
          });
          
        // Also record in order_history
        await recordOrderHistory(
          orderId,
          'assignment_expired',
          assignment.restaurant_id,
          { assignment_id: assignment.id },
          now
        );
      }
      
      // Check if all assignments are now expired/rejected
      const { data: activeAssignments } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', orderId)
        .in('status', ['pending', 'accepted']);
      
      // If no active assignments remain, cancel the order
      if (!activeAssignments || activeAssignments.length === 0) {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);
          
        // Record cancellation in order_history
        await recordOrderHistory(
          orderId,
          'cancelled',
          null,
          { reason: 'All restaurants timed out or rejected the order' }
        );
      }
    }
    
    // Now fetch the current status after potentially updating things
    const { data: assignments, error } = await supabase
      .from('restaurant_assignments')
      .select(`
        id, 
        status, 
        restaurant_id, 
        expires_at, 
        restaurants!restaurant_assignments_restaurant_id_restaurants_fkey(id, name)
      `)
      .eq('order_id', orderId);
    
    if (error || !assignments) {
      console.error('Error fetching assignments:', error);
      return null;
    }
    
    // Count status types
    const pendingCount = assignments.filter(a => a.status === 'pending').length;
    const acceptedCount = assignments.filter(a => a.status === 'accepted').length;
    const rejectedCount = assignments.filter(a => a.status === 'rejected').length;
    const expiredCount = assignments.filter(a => a.status === 'expired').length;
    
    // Find if there's an accepted assignment
    const acceptedAssignment = assignments.find(a => a.status === 'accepted');
    
    // Get restaurant name safely - handle the nested structure properly
    const restaurantName = acceptedAssignment && 
                           acceptedAssignment.restaurants && 
                           typeof acceptedAssignment.restaurants === 'object' ? 
                           (acceptedAssignment.restaurants as any).name : undefined;
    
    // Get the most recent active assignment for timer
    const pendingAssignments = assignments.filter(a => a.status === 'pending');
    const mostRecentAssignment = pendingAssignments.length > 0 
      ? pendingAssignments.sort((a, b) => 
          new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime()
        )[0]
      : null;
    
    return {
      status: acceptedAssignment ? 'accepted' : 
              pendingCount > 0 ? 'awaiting_response' : 
              'no_response',
      assigned_restaurant_id: acceptedAssignment?.restaurant_id,
      restaurant_name: restaurantName,
      assignment_id: acceptedAssignment?.id,
      expires_at: mostRecentAssignment?.expires_at,
      attempt_count: assignments.length,
      pending_count: pendingCount,
      accepted_count: acceptedCount,
      rejected_count: rejectedCount,
      expired_count: expiredCount
    };
  } catch (error) {
    console.error('Error checking assignment status:', error);
    return null;
  }
};

/**
 * Sends restaurant response (accept/reject) to the webhook
 */
export const sendRestaurantResponse = async (
  orderId: string,
  restaurantId: string,
  assignmentId: string,
  latitude: number,
  longitude: number,
  action: 'accept' | 'reject'
): Promise<WebhookResponse> => {
  try {
    const requestBody: RestaurantResponseRequest = {
      order_id: orderId,
      restaurant_id: restaurantId,
      assignment_id: assignmentId,
      latitude: latitude,
      longitude: longitude,
      action: action,
    };

    const response = await fetch(`${WEBHOOK_URL}/order-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Webhook request failed:', errorData);
      return { success: false, error: errorData.error || 'Webhook request failed' };
    }

    const responseData: WebhookResponse = await response.json();
    
    // Record the restaurant response in order_history
    await recordOrderHistory(
      orderId,
      `restaurant_${action}ed`,
      restaurantId,
      { assignment_id: assignmentId }
    );
    
    return responseData;
  } catch (error) {
    console.error('Error sending restaurant response to webhook:', error);
    return { success: false, error: 'Failed to send restaurant response to webhook' };
  }
};
