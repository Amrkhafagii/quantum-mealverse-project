
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
  longitude: number
): Promise<WebhookResponse> => {
  try {
    console.log(`Sending order ${orderId} to webhook with location:`, { latitude, longitude });
    
    const data: OrderAssignmentRequest = {
      order_id: orderId,
      latitude,
      longitude,
      action: 'assign'
    };

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
    
    // Log the assignment attempt in the client side
    if (response.data?.result?.attempt_number) {
      console.log(`[REASSIGNMENT CLIENT] Order ${orderId} - ${response.data.result.attempt_number > 1 ? 'Reassigned' : 'Assigned'} to restaurant on attempt #${response.data.result.attempt_number}`);
      
      // If this was a reassignment, show more details
      if (response.data.result.attempt_number > 1) {
        console.log(`[REASSIGNMENT CLIENT] Order ${orderId} - Restaurant ${response.data.result.restaurant_name} (${response.data.result.restaurant_id})`);
        console.log(`[REASSIGNMENT CLIENT] Order ${orderId} - Expires at ${response.data.result.expires_at}`);
      }
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

    if (action === 'reject' && response.data?.result?.attempt_number) {
      console.log(`[REASSIGNMENT CLIENT] Order ${orderId} - Rejected, attempting reassignment (attempt #${response.data.result.attempt_number})`);
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
    console.log(`[REASSIGNMENT CLIENT] Checking assignment status for order: ${orderId}`);
    
    // First check for active assignments in restaurant_assignments table
    // Fix the relationship query by specifying the correct foreign key
    const { data: assignments, error: assignmentError } = await supabase
      .from('restaurant_assignments')
      .select(`
        id, 
        status, 
        order_id, 
        restaurant_id, 
        expires_at, 
        created_at,
        restaurants:restaurant_id (
          id, 
          name
        )
      `)
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (assignmentError) {
      console.error('Error fetching assignments:', assignmentError);
      console.log('No active assignments found, checking order status');
    } else if (assignments && assignments.length > 0) {
      const assignment = assignments[0];
      console.log('[REASSIGNMENT CLIENT] Active assignment found:', assignment);
      
      // Get the assignment attempt count to know if this is a reassignment
      const { count } = await supabase
        .from('restaurant_assignment_history')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', orderId);
      
      // Validate that expires_at is a valid date in the future
      const expiresAt = assignment.expires_at;
      const expiresAtDate = new Date(expiresAt);
      const isValidDate = !isNaN(expiresAtDate.getTime());
      const isFutureDate = isValidDate && expiresAtDate > new Date();
      
      console.log(`[REASSIGNMENT CLIENT] Assignment details for ${orderId}:`, {
        status: 'awaiting_response',
        restaurant: assignment.restaurants ? assignment.restaurants.name : 'Restaurant',
        attempt_count: count,
        expires_at: expiresAt,
        expiresAtValid: isValidDate,
        isFutureDate,
        timeRemaining: isValidDate ? Math.floor((expiresAtDate.getTime() - Date.now()) / 1000) : 'invalid date'
      });
      
      return {
        status: 'awaiting_response',
        assigned_restaurant_id: assignment.restaurant_id,
        restaurant_name: assignment.restaurants ? assignment.restaurants.name : 'Restaurant',
        assignment_id: assignment.id,
        expires_at: expiresAt,
        attempt_count: count || 0
      };
    } else {
      console.log('[REASSIGNMENT CLIENT] No active assignments found for order:', orderId);
    }
    
    // Get attempt count from assignment history
    const { count } = await supabase
      .from('restaurant_assignment_history')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId);
    
    console.log(`[REASSIGNMENT CLIENT] Total assignment attempts for order ${orderId}: ${count}`);
    
    // Get current order status
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
