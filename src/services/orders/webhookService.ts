
import { supabase } from '@/integrations/supabase/client';
import { 
  OrderAssignmentRequest, 
  RestaurantResponseRequest, 
  WebhookResponse 
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

export const checkAssignmentStatus = async (orderId: string) => {
  try {
    console.log(`Checking assignment status for order: ${orderId}`);
    
    // First check for active assignments in restaurant_assignments table
    const { data: assignment, error: assignmentError } = await supabase
      .from('restaurant_assignments')
      .select('*, restaurant:restaurants(id, name)')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (assignmentError) {
      console.log('No active assignments found, checking order status');
    } else {
      console.log('Active assignment found:', assignment);
    }
    
    // Get attempt count from assignment history
    const { count } = await supabase
      .from('restaurant_assignment_history')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId);
    
    console.log(`Assignment attempt count for order ${orderId}: ${count}`);
    
    // Get current order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status, restaurant_id, restaurant:restaurants(id, name)')
      .eq('id', orderId)
      .single();
    
    if (orderError) {
      console.error('Error fetching order details:', orderError);
    }
    
    // If there's an active assignment, return its details
    if (assignment) {
      const restaurantName = getRestaurantName(assignment.restaurant);
      
      console.log(`Assignment details for ${orderId}:`, {
        status: 'awaiting_response',
        restaurant: restaurantName,
        expires_at: assignment.expires_at
      });
      
      return {
        status: 'awaiting_response',
        assigned_restaurant_id: assignment.restaurant_id,
        restaurant_name: restaurantName,
        assignment_id: assignment.id,
        expires_at: assignment.expires_at,
        attempt_count: count || 1
      };
    }
    
    // If no active assignment but order exists, return order status
    if (order) {
      const restaurantName = getRestaurantName(order.restaurant);
      
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
