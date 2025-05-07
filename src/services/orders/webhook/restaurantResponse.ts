
import { supabase } from '@/integrations/supabase/client';
import { RestaurantResponseRequest, WebhookResponse } from '@/types/webhook';
import { logApiCall } from '@/services/loggerService';
import { recordOrderHistory } from './orderHistoryService';

const WEBHOOK_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://hozgutjvbrljeijybnyg.supabase.co/functions/v1';

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
    
    // Update the order table directly if webhook might have failed
    if (action === 'accept') {
      // Update the order status to accepted directly
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: `restaurant_${action}ed`,
          restaurant_id: restaurantId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (error) {
        console.error('Failed to update order status directly:', error);
      } else {
        console.log(`Successfully updated order ${orderId} status to restaurant_${action}ed`);
        
        // Cancel ALL other assignments for this order
        const { error: cancelError } = await supabase
          .from('restaurant_assignments')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString(),
            details: { cancelled_reason: 'Order accepted by another restaurant' }
          })
          .eq('order_id', orderId)
          .neq('status', 'accepted'); // Only exclude those already marked as accepted
          
        if (cancelError) {
          console.error('Failed to cancel other assignments:', cancelError);
        } else {
          console.log(`Successfully cancelled all other assignments for order ${orderId}`);
        }
      }
    }
    
    return responseData;
  } catch (error) {
    console.error(`Error in sendRestaurantResponse:`, error);
    return { success: false, error: 'Failed to send restaurant response to webhook' };
  }
};
