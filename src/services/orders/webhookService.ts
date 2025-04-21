
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
  restaurantId?: string | null,
  details?: any,
  expiredAt?: string
): Promise<void> => {
  try {
    // Get restaurant name if restaurantId is provided
    let restaurantName = null;
    if (restaurantId) {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();
      
      restaurantName = restaurant?.name;
    }

    // Debugging: Log the data we're about to insert
    console.log('Recording order history:', {
      order_id: orderId,
      status,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      details,
      expired_at: expiredAt
    });
    
    // Insert record into order_history table
    const { data, error } = await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        status,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        details,
        expired_at: expiredAt
      });
      
    if (error) {
      console.error('Error recording order history:', error);
      return;
    }
      
    console.log(`Order history recorded for ${orderId}, status: ${status}`, data);
  } catch (error) {
    console.error('Error recording order history:', error);
  }
};

/**
 * Makes a direct call to check and handle expired assignments
 * This is a server-side operation that doesn't need frontend involvement
 */
export const checkExpiredAssignments = async (): Promise<WebhookResponse> => {
  try {
    const requestBody = {
      action: 'check_expired'
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
      console.error('Check expired request failed:', errorData);
      return { success: false, error: errorData.error || 'Check expired request failed' };
    }

    const responseData: WebhookResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error checking expired assignments:', error);
    return { success: false, error: 'Failed to check expired assignments' };
  }
};

/**
 * Checks the current status of an order's restaurant assignments
 * and automatically handles expired assignments
 */
export const checkAssignmentStatus = async (orderId: string): Promise<AssignmentStatus | null> => {
  try {
    // Check for any expired assignments that need to be handled
    await checkExpiredAssignments();
    
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
