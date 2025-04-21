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
  const restaurantData = Array.isArray(restaurant) ? restaurant[0] : restaurant;
  return restaurantData?.name || 'Restaurant';
};

export const sendOrderToWebhook = async (
  orderId: string,
  latitude: number,
  longitude: number,
) : Promise<WebhookResponse> => {
  try {
    console.log(`Sending order ${orderId} to webhook with location:`, { latitude, longitude });
    const data: OrderAssignmentRequest = {
      order_id: orderId,
      latitude,
      longitude,
      action: 'assign'
    };
    const response = await supabase.functions.invoke('order-webhook', { body: data });
    if (response.error) {
      console.error('Webhook error:', response.error);
      return { success: false, error: response.error.message || 'Failed to call webhook' };
    }
    console.log('Webhook response:', response.data);
    return { success: true, result: response.data };
  } catch (error: any) {
    console.error('Error sending order to webhook:', error);
    return { success: false, error: error.message || 'Failed to send order data' };
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
    console.log(`[RESTAURANT DEBUG] Simulating ${action} for ${restaurantId}`);
    const data: RestaurantResponseRequest = {
      order_id: orderId,
      restaurant_id: restaurantId,
      assignment_id: assignmentId,
      latitude,
      longitude,
      action
    };
    const response = await supabase.functions.invoke('order-webhook', { body: data });
    if (response.error) {
      return { success: false, error: response.error.message || `Failed to simulate ${action}` };
    }
    return { success: true, result: response.data };
  } catch (error: any) {
    return { success: false, error: error.message || `Failed to simulate restaurant ${action}` };
  }
};

export const checkAssignmentStatus = async (orderId: string): Promise<AssignmentStatus> => {
  try {
    // Get the order status first to determine if a restaurant has accepted
    const { data: order } = await supabase
      .from('orders')
      .select('status, restaurant_id')
      .eq('id', orderId)
      .single();
    
    // If the order has been accepted by a restaurant (status is 'processing' or later)
    if (order && order.restaurant_id && order.status !== 'pending' && order.status !== 'awaiting_restaurant') {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', order.restaurant_id)
        .single();
      
      return {
        status: order.status,
        assigned_restaurant_id: order.restaurant_id,
        restaurant_name: restaurant?.name || 'Restaurant',
        attempt_count: 0
      };
    }
    
    // Otherwise, check for pending assignments
    const { data: assignments } = await supabase
      .from('restaurant_assignments')
      .select('id, status, order_id, restaurant_id, expires_at, created_at')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (assignments && assignments.length > 0) {
      // Don't include restaurant name for pending assignments
      return {
        status: 'awaiting_response',
        assigned_restaurant_id: null,
        restaurant_name: null,
        assignment_id: assignments[0].id,
        expires_at: assignments[0].expires_at,
        attempt_count: 1,
        pending_count: assignments.length,
      };
    }

    // No pending assignment found and no accepted restaurant
    return {
      status: order?.status || 'unknown',
      assigned_restaurant_id: null,
      restaurant_name: null,
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
