
import { supabase } from '@/integrations/supabase/client';
import { 
  OrderAssignmentRequest, 
  RestaurantResponseRequest, 
  WebhookResponse,
  AssignmentStatus 
} from '@/types/webhook';

// Helper function to safely get restaurant name
const getRestaurantName = (restaurant: any): string => {
  if (!restaurant) return 'Restaurant';
  
  // Handle array case
  const restaurantData = Array.isArray(restaurant) ? restaurant[0] : restaurant;
  return restaurantData?.name || 'Restaurant';
};

export const sendOrderToWebhook = async (
  orderId: string,
  latitude: number,
  longitude: number,
  isExpiredReassignment = false
): Promise<WebhookResponse> => {
  try {
    console.log(`Sending order ${orderId} to webhook with location:`, { 
      latitude, 
      longitude, 
      isExpiredReassignment 
    });
    
    const data: OrderAssignmentRequest & { expired_reassignment?: boolean } = {
      order_id: orderId,
      latitude,
      longitude,
      action: 'assign'
    };
    
    // Add flag to indicate this is a reassignment due to expiration
    if (isExpiredReassignment) {
      data.expired_reassignment = true;
    }

    const response = await supabase.functions.invoke('order-webhook', {
      body: data
    });

    if (response.error) {
      console.error('Webhook error:', response.error);
      return {
        success: false,
        error: response.error.message || 'Failed to call webhook'
      };
    }

    console.log('Webhook response:', response.data);
    
    // If multiple restaurants were assigned, log it
    if (response.data?.result?.assignment_count > 1) {
      console.log(`[ASSIGNMENT CLIENT] Order ${orderId} - Assigned to ${response.data.result.assignment_count} restaurants`);
      if (response.data.result.restaurant_names && response.data.result.restaurant_names.length) {
        console.log(`[ASSIGNMENT CLIENT] Order ${orderId} - Restaurants: ${response.data.result.restaurant_names.join(', ')}`);
      }
      console.log(`[ASSIGNMENT CLIENT] Order ${orderId} - Expires at ${response.data.result.expires_at}`);
    }
    
    return {
      success: true,
      result: response.data
    };
  } catch (error: any) {
    console.error('Error sending order to webhook:', error);
    return {
      success: false,
      error: error.message || 'Failed to send order data'
    };
  }
};

export const simulateRestaurantResponse = async (
  orderId: string,
  restaurantId: string,
  assignmentId: string,
  action: 'accept' | 'reject',
  latitude: number,
  longitude: number
): Promise<WebhookResponse> => {
  try {
    console.log(`[REASSIGNMENT CLIENT] Restaurant ${action === 'accept' ? 'accepting' : 'rejecting'} order ${orderId}`);
    
    const data: RestaurantResponseRequest = {
      order_id: orderId,
      restaurant_id: restaurantId,
      assignment_id: assignmentId,
      latitude,
      longitude,
      action
    };

    const response = await supabase.functions.invoke('order-webhook', {
      body: data
    });
    
    if (response.error) {
      return {
        success: false,
        error: response.error.message || `Failed to simulate ${action}`
      };
    }

    return {
      success: true,
      result: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || `Failed to simulate restaurant ${action}`
    };
  }
};

export const checkAssignmentStatus = async (orderId: string): Promise<AssignmentStatus> => {
  try {
    console.log(`[ASSIGNMENT CLIENT] Checking assignment status for order: ${orderId}`);
    
    // First check for active assignments in restaurant_assignments table
    const { data: assignments, error: assignmentError } = await supabase
      .from('restaurant_assignments')
      .select('id, status, order_id, restaurant_id, expires_at, created_at')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (assignmentError) {
      console.error('Error fetching assignments:', assignmentError);
      console.log('No active assignments found, checking order status');
    } else if (assignments && assignments.length > 0) {
      console.log(`[ASSIGNMENT CLIENT] Found ${assignments.length} pending assignments for order ${orderId}`);
      
      // Get the total number of restaurants this order was sent to
      const { count } = await supabase
        .from('restaurant_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', orderId);
      
      // Get restaurants that have responded (either accepted or rejected)
      const { data: responded } = await supabase
        .from('restaurant_assignments')
        .select('status')
        .eq('order_id', orderId)
        .or('status.eq.accepted,status.eq.rejected');
      
      const accepted = responded?.filter(a => a.status === 'accepted').length || 0;
      const rejected = responded?.filter(a => a.status === 'rejected').length || 0;
      
      // Get one assignment to get the expires_at time
      const assignment = assignments[0];
      
      // Get restaurant details separately
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('id', assignment.restaurant_id)
        .single();
      
      const expiresAt = assignment.expires_at;
      const expiresAtDate = new Date(expiresAt);
      const isValidDate = !isNaN(expiresAtDate.getTime());
      const isFutureDate = isValidDate && expiresAtDate > new Date();
      const restaurantName = restaurant?.name || 'Restaurant';
      
      console.log(`[ASSIGNMENT CLIENT] Assignment details for ${orderId}:`, {
        status: 'awaiting_response',
        pending_count: assignments.length,
        total_count: count,
        accepted,
        rejected,
        expires_at: expiresAt,
        timeRemaining: isValidDate ? Math.floor((expiresAtDate.getTime() - Date.now()) / 1000) : 'invalid date'
      });
      
      return {
        status: 'awaiting_response',
        assigned_restaurant_id: assignment.restaurant_id,
        restaurant_name: restaurantName,
        assignment_id: assignment.id,
        expires_at: expiresAt,
        attempt_count: count || 0,
        pending_count: assignments.length,
        accepted_count: accepted,
        rejected_count: rejected
      };
    } else {
      console.log('[ASSIGNMENT CLIENT] No active assignments found for order:', orderId);
    }
    
    // Get current order status if no pending assignments
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status, restaurant_id')
      .eq('id', orderId)
      .single();
    
    if (orderError) {
      console.error('Error fetching order details:', orderError);
    }
    
    // Get restaurant details separately if there's a restaurant_id
    let restaurantName = 'Restaurant';
    if (order?.restaurant_id) {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', order.restaurant_id)
        .single();
      
      if (restaurant) {
        restaurantName = restaurant.name;
      }
    }
    
    // Get total assignment count
    const { count } = await supabase
      .from('restaurant_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId);
    
    // If no active assignment but order exists, return order status
    if (order) {
      return {
        status: order.status || 'unknown',
        assigned_restaurant_id: order.restaurant_id,
        restaurant_name: restaurantName,
        attempt_count: count || 0
      };
    }
    
    return {
      status: 'error',
      attempt_count: 0
    };
  } catch (error) {
    console.error('Error checking assignment status:', error);
    return {
      status: 'error',
      attempt_count: 0
    };
  }
};
