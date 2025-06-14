
import { supabase } from '@/integrations/supabase/client';
import { RestaurantResponseRequest, WebhookResponse, OrderStatus } from '@/types/webhook';
import { recordOrderHistory } from './orderHistoryService';

const WEBHOOK_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://hozgutjvbrljeijybnyg.supabase.co/functions/v1';

/**
 * Logs webhook request with enhanced error handling
 */
const logWebhookRequest = async (url: string, requestBody: RestaurantResponseRequest): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('webhook_logs')
      .insert({
        payload: {
          url,
          request_type: 'restaurant_response',
          request_data: JSON.parse(JSON.stringify(requestBody)),
          timestamp: new Date().toISOString()
        }
      });

    if (error) {
      console.error('Error logging webhook request:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Critical error logging webhook request:', error);
    return false;
  }
};

/**
 * Handles order acceptance with efficient assignment cancellation
 */
const handleOrderAcceptance = async (orderId: string, restaurantId: string): Promise<boolean> => {
  try {
    // Update the order status to accepted
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'restaurant_accepted',
        restaurant_id: restaurantId,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (orderError) {
      console.error('Failed to update order status:', orderError);
      return false;
    }

    console.log(`Successfully updated order ${orderId} status to restaurant_accepted`);
    
    // Cancel ALL other assignments for this order in a single operation
    const { error: cancelError } = await supabase
      .from('restaurant_assignments')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        details: { cancelled_reason: 'Order accepted by another restaurant' }
      })
      .eq('order_id', orderId)
      .neq('status', 'accepted');
      
    if (cancelError) {
      console.error('Failed to cancel other assignments:', cancelError);
      return false;
    }

    console.log(`Successfully cancelled all other assignments for order ${orderId}`);
    return true;
  } catch (error) {
    console.error('Critical error handling order acceptance:', error);
    return false;
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

    // Log the request (don't fail if logging fails)
    await logWebhookRequest(`${WEBHOOK_URL}/order-webhook`, requestBody);

    // Get current session for authentication
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

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
      return { success: false, error: errorData.error || 'Webhook request failed' };
    }

    const responseData: WebhookResponse = await response.json();
    
    // Record the restaurant response in order_history using proper enum values
    const status = action === 'accept' ? OrderStatus.RESTAURANT_ACCEPTED : OrderStatus.RESTAURANT_REJECTED;
    
    try {
      await recordOrderHistory(
        orderId,
        status,
        restaurantId,
        { assignment_id: assignmentId }
      );
    } catch (historyError) {
      console.warn(`Failed to record history but webhook succeeded:`, historyError);
    }
    
    // Handle direct updates for acceptance
    if (action === 'accept') {
      const updateSuccess = await handleOrderAcceptance(orderId, restaurantId);
      if (!updateSuccess) {
        console.error('Webhook succeeded but direct order update failed');
        return { 
          success: false, 
          error: 'Order acceptance processing failed' 
        };
      }
    }
    
    return responseData;
  } catch (error) {
    console.error(`Error in sendRestaurantResponse:`, error);
    return { 
      success: false, 
      error: 'Failed to send restaurant response to webhook' 
    };
  }
};
