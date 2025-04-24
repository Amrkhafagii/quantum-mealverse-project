
import { supabase } from './supabase/client';
import { WebhookResponse, OrderAssignmentRequest, RestaurantResponseRequest } from '@/types/webhook';

// Helper function to safely get restaurant name
const getRestaurantName = (restaurant: any): string => {
  if (!restaurant) return 'Restaurant';
  
  // Handle array case
  const restaurantData = Array.isArray(restaurant) ? restaurant[0] : restaurant;
  return restaurantData?.name || 'Restaurant';
};

// Helper function to call the webhook with order data
export async function sendOrderToWebhook(
  orderId: string,
  latitude: number,
  longitude: number
): Promise<WebhookResponse> {
  try {
    const data: OrderAssignmentRequest = {
      order_id: orderId,
      latitude,
      longitude,
      action: 'assign'
    };

    console.log('Sending order to webhook:', data);
    
    const response = await supabase.functions.invoke('order-webhook', {
      body: data
    });

    console.log('Webhook response:', response);
    
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
}

// Helper to simulate restaurant response
export async function simulateRestaurantResponse(
  orderId: string,
  restaurantId: string,
  assignmentId: string,
  action: 'accept' | 'reject',
  latitude: number,
  longitude: number
): Promise<WebhookResponse> {
  try {
    // Validate inputs to prevent null restaurantId being sent
    if (!restaurantId) {
      console.error('Cannot simulate restaurant response with null restaurantId');
      return {
        success: false,
        error: 'Missing restaurant ID'
      };
    }

    if (!assignmentId) {
      console.error('Cannot simulate restaurant response with null assignmentId');
      return {
        success: false,
        error: 'Missing assignment ID'
      };
    }

    const data: RestaurantResponseRequest = {
      order_id: orderId,
      restaurant_id: restaurantId,
      assignment_id: assignmentId,
      latitude,
      longitude,
      action
    };

    console.log(`Simulating restaurant ${action}:`, data);
    
    const response = await supabase.functions.invoke('order-webhook', {
      body: data
    });
    
    if (response.error) {
      console.error('Webhook response error:', response.error);
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
    console.error(`Error simulating restaurant ${action}:`, error);
    return {
      success: false,
      error: error.message || `Failed to simulate restaurant ${action}`
    };
  }
}

// Function to check assignment status
export async function checkAssignmentStatus(orderId: string) {
  try {
    // Now we're using the restaurant_assignments table directly
    const { data: assignment } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, order_id, status, created_at, restaurants:restaurant_id(id, name)')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const { count } = await supabase
      .from('restaurant_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId);
    
    const { data: order } = await supabase
      .from('orders')
      .select('status, restaurant_id, restaurant:restaurant_id(id, name)')
      .eq('id', orderId)
      .single();
    
    if (assignment) {
      const restaurantName = getRestaurantName(assignment.restaurants);
      
      return {
        status: 'awaiting_response',
        assigned_restaurant_id: assignment.restaurant_id,
        restaurant_name: restaurantName,
        assignment_id: assignment.id,
        expires_at: assignment.created_at, // Using created_at instead of expires_at
        attempt_count: count || 0
      };
    }
    
    const restaurantName = getRestaurantName(order?.restaurant);
    
    return {
      status: order?.status || 'unknown',
      assigned_restaurant_id: order?.restaurant_id,
      restaurant_name: restaurantName,
      attempt_count: count || 0
    };
  } catch (error) {
    console.error('Error checking assignment status:', error);
    return {
      status: 'error',
      attempt_count: 0
    };
  }
}
