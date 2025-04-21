
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
 * Checks the current status of an order's restaurant assignments
 */
export const checkAssignmentStatus = async (orderId: string): Promise<AssignmentStatus | null> => {
  try {
    // Check for any expired assignments that need to be handled
    const now = new Date().toISOString();
    
    // Find assignments that have expired but still have pending status
    const { data: expiredAssignments } = await supabase
      .from('restaurant_assignments')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .lt('expires_at', now);
    
    // If we found expired assignments, mark them as expired
    if (expiredAssignments && expiredAssignments.length > 0) {
      // Update all expired assignments
      await supabase
        .from('restaurant_assignments')
        .update({ status: 'expired' })
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .lt('expires_at', now);
      
      // Check if all assignments are now expired/rejected
      const { data: activeAssignments } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', orderId)
        .eq('status', 'pending');
      
      // If no active assignments remain, cancel the order
      if (!activeAssignments || activeAssignments.length === 0) {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);
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
        restaurants(id, name)
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
    
    // Find if there's an accepted assignment
    const acceptedAssignment = assignments.find(a => a.status === 'accepted');
    
    // Get restaurant name safely
    const restaurantName = acceptedAssignment?.restaurants?.name || undefined;
    
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
      rejected_count: rejectedCount
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
    return responseData;
  } catch (error) {
    console.error('Error sending restaurant response to webhook:', error);
    return { success: false, error: 'Failed to send restaurant response to webhook' };
  }
};
