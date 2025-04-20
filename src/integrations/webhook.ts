
import { supabase } from './supabase/client';

// Type definitions for webhook requests
export interface OrderAssignmentRequest {
  order_id: string;
  latitude: number;
  longitude: number;
  action: 'assign';
}

export interface RestaurantResponseRequest {
  order_id: string;
  restaurant_id: string;
  assignment_id: string;
  latitude: number;
  longitude: number;
  action: 'accept' | 'reject';
}

export type WebhookRequest = OrderAssignmentRequest | RestaurantResponseRequest;

// Helper function to call the webhook with order data
export async function sendOrderToWebhook(
  orderId: string,
  latitude: number,
  longitude: number
): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
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
  } catch (error) {
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
): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  try {
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
  } catch (error) {
    console.error(`Error simulating restaurant ${action}:`, error);
    return {
      success: false,
      error: error.message || `Failed to simulate restaurant ${action}`
    };
  }
}

// Function to check assignment status
export async function checkAssignmentStatus(orderId: string): Promise<{
  status: string;
  assigned_restaurant_id?: string;
  restaurant_name?: string;
  assignment_id?: string;
  expires_at?: string;
  attempt_count: number;
}> {
  try {
    // Get the current assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('restaurant_assignments')
      .select(`
        *,
        restaurant:restaurants(id, name)
      `)
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    // Get the count of assignment attempts
    const { count } = await supabase
      .from('restaurant_assignment_history')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId);
    
    // Get the order status
    const { data: order } = await supabase
      .from('orders')
      .select(`
        status, 
        restaurant_id,
        restaurant:restaurants(id, name)
      `)
      .eq('id', orderId)
      .single();
    
    if (assignment) {
      return {
        status: 'awaiting_response',
        assigned_restaurant_id: assignment.restaurant_id,
        restaurant_name: assignment.restaurant?.name || 'Restaurant',
        assignment_id: assignment.id,
        expires_at: assignment.expires_at,
        attempt_count: count || 0
      };
    }
    
    return {
      status: order?.status || 'unknown',
      assigned_restaurant_id: order?.restaurant_id,
      restaurant_name: order?.restaurant?.name || 'Restaurant',
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
