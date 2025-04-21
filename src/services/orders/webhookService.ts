
import { supabase } from '@/integrations/supabase/client';
import { AssignmentStatus, OrderAssignmentRequest, RestaurantResponseRequest, WebhookResponse } from '@/types/webhook';
import { logApiCall } from '@/services/loggerService';

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

    // Get current session for authentication
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

    // Log the request before sending
    await logApiCall(`${WEBHOOK_URL}/order-webhook`, requestBody, null);

    const response = await fetch(`${WEBHOOK_URL}/order-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    
    // Log the response
    await logApiCall(`${WEBHOOK_URL}/order-webhook`, requestBody, responseData);

    if (!response.ok) {
      console.error('Webhook request failed:', responseData);
      return { success: false, error: responseData.error || 'Webhook request failed' };
    }

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
    console.log('Calling checkExpiredAssignments webhook');
    const requestBody = {
      action: 'check_expired'
    };

    // Get current session for authentication
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

    // Log the request before sending
    await logApiCall(`${WEBHOOK_URL}/order-webhook`, requestBody, null);

    // Use direct fetch instead of supabase.functions.invoke for more control
    const response = await fetch(`${WEBHOOK_URL}/order-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Check expired request failed:', response.status, errorText);
      return { 
        success: false, 
        error: `Check expired request failed: ${response.status} ${errorText}`
      };
    }

    const data = await response.json();
    console.log('Check expired response:', data);

    // Log the response
    await logApiCall(`${WEBHOOK_URL}/order-webhook`, requestBody, data);

    return data;
  } catch (error) {
    console.error('Error checking expired assignments:', error);
    return { 
      success: false, 
      error: 'Failed to check expired assignments' 
    };
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
 * Manually handles expired assignments for a specific order
 * useful for testing or manual intervention
 */
export const forceExpireAssignments = async (orderId: string): Promise<WebhookResponse> => {
  try {
    console.log(`Forcing expiration of assignments for order ${orderId}`);
    
    // First, get all pending assignments for this order
    const { data: pendingAssignments, error: fetchError } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id')
      .eq('order_id', orderId)
      .eq('status', 'pending');
    
    if (fetchError) {
      console.error('Error fetching pending assignments:', fetchError);
      return { success: false, error: 'Failed to fetch pending assignments' };
    }
    
    if (!pendingAssignments || pendingAssignments.length === 0) {
      return { success: true, message: 'No pending assignments found' };
    }
    
    console.log(`Found ${pendingAssignments.length} pending assignments to expire`);
    
    // Mark all pending assignments as expired
    const updates = pendingAssignments.map(async (assignment) => {
      // Update the assignment status
      const { error: updateError } = await supabase
        .from('restaurant_assignments')
        .update({ status: 'expired' })
        .eq('id', assignment.id);
      
      if (updateError) {
        console.error(`Error updating assignment ${assignment.id}:`, updateError);
        return false;
      }
      
      // Record in history
      await recordOrderHistory(
        orderId,
        'assignment_expired',
        assignment.restaurant_id,
        { assignment_id: assignment.id, forced: true },
        new Date().toISOString()
      );
      
      return true;
    });
    
    const results = await Promise.all(updates);
    const successCount = results.filter(r => r).length;
    
    // Check if all pending assignments are now expired
    const { data: remainingPending } = await supabase
      .from('restaurant_assignments')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'pending');
    
    if (!remainingPending || remainingPending.length === 0) {
      // If no assignments are accepted, update order status
      const { data: acceptedCount } = await supabase
        .from('restaurant_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('order_id', orderId)
        .eq('status', 'accepted');
        
      if (acceptedCount === 0) {
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({ status: 'no_restaurant_accepted' })
          .eq('id', orderId);
          
        if (orderUpdateError) {
          console.error('Error updating order status:', orderUpdateError);
        } else {
          await recordOrderHistory(
            orderId,
            'no_restaurant_accepted',
            null,
            { reason: 'All restaurant assignments expired or were manually expired' }
          );
        }
      }
    }
    
    return { 
      success: true, 
      message: `Expired ${successCount} of ${pendingAssignments.length} assignments` 
    };
  } catch (error) {
    console.error('Error forcing assignment expiration:', error);
    return { success: false, error: 'Failed to expire assignments' };
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

    // Get current session for authentication
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

    // Log the request before sending
    await logApiCall(`${WEBHOOK_URL}/order-webhook`, requestBody, null);

    const response = await fetch(`${WEBHOOK_URL}/order-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
