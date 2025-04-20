
import { supabase } from '@/integrations/supabase/client';

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

export const sendOrderToWebhook = async (
  orderId: string,
  latitude: number,
  longitude: number
): Promise<{ success: boolean; result?: any; error?: string }> => {
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
): Promise<{ success: boolean; result?: any; error?: string }> => {
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
    const { data: assignment } = await supabase
      .from('restaurant_assignments')
      .select('*, restaurant:restaurants(id, name)')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const { count } = await supabase
      .from('restaurant_assignment_history')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId);
    
    const { data: order } = await supabase
      .from('orders')
      .select('status, restaurant_id, restaurant:restaurants(id, name)')
      .eq('id', orderId)
      .single();
    
    if (assignment) {
      let restaurantName = 'Restaurant';
      
      if (assignment.restaurant != null && 
          typeof assignment.restaurant === 'object') {
        // Fixed: Check if restaurant is an array and access first item if needed
        const restaurantObj = Array.isArray(assignment.restaurant) 
          ? assignment.restaurant[0] 
          : assignment.restaurant as { id: string; name: string };
          
        if (restaurantObj && 'name' in restaurantObj) {
          restaurantName = restaurantObj.name;
        }
      }
        
      return {
        status: 'awaiting_response',
        assigned_restaurant_id: assignment.restaurant_id,
        restaurant_name: restaurantName,
        assignment_id: assignment.id,
        expires_at: assignment.expires_at,
        attempt_count: count || 0
      };
    }
    
    let restaurantName = 'Restaurant';
    
    if (order?.restaurant != null && 
        typeof order.restaurant === 'object') {
      // Fixed: Check if restaurant is an array and access first item if needed
      const restaurantObj = Array.isArray(order.restaurant) 
        ? order.restaurant[0] 
        : order.restaurant as { id: string; name: string };
        
      if (restaurantObj && 'name' in restaurantObj) {
        restaurantName = restaurantObj.name;
      }
    }
    
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
};
