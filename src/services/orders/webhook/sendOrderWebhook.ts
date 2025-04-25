
import { supabase } from '@/integrations/supabase/client';
import { OrderAssignmentRequest, WebhookResponse, OrderStatus } from '@/types/webhook';
import { logApiCall } from '@/services/loggerService';
import { recordOrderHistory } from './orderHistoryService';
import { v4 as uuidv4 } from 'uuid';

// Function URL
const WEBHOOK_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://hozgutjvbrljeijybnyg.supabase.co/functions/v1';

/**
 * Sends an order to the webhook for restaurant assignment with idempotency support
 */
export const sendOrderToWebhook = async (
  orderId: string,
  latitude: number,
  longitude: number,
  expiredReassignment = false
): Promise<WebhookResponse> => {
  try {
    // Create an idempotency key
    const idempotencyKey = uuidv4();
    
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

    // First, update order status to AWAITING_RESTAURANT
    const { error: statusError } = await supabase
      .from('orders')
      .update({ status: OrderStatus.AWAITING_RESTAURANT })
      .eq('id', orderId)
      .eq('status', OrderStatus.PENDING);  // Only if it's in PENDING state

    if (statusError) {
      console.error('Failed to update order status:', statusError);
      return { success: false, error: 'Failed to update order status' };
    }
    
    // Record in order history with the idempotency key
    await recordOrderHistory(
      orderId,
      OrderStatus.AWAITING_RESTAURANT,
      null,
      { 
        idempotencyKey,
        latitude,
        longitude,
        expired_reassignment: expiredReassignment
      }
    );

    // Send the webhook request with idempotency header
    const response = await fetch(`${WEBHOOK_URL}/order-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    
    // Log the response
    await logApiCall(`${WEBHOOK_URL}/order-webhook`, requestBody, responseData);

    if (!response.ok) {
      return { success: false, error: responseData.error || 'Webhook request failed' };
    }

    // Update order to RESTAURANT_ASSIGNED if assignments were created
    if (responseData.success && responseData.result && responseData.result.assignment_count > 0) {
      // Update order status to RESTAURANT_ASSIGNED
      await supabase
        .from('orders')
        .update({ status: OrderStatus.RESTAURANT_ASSIGNED })
        .eq('id', orderId);
        
      // Record the transition to RESTAURANT_ASSIGNED
      await recordOrderHistory(
        orderId,
        OrderStatus.RESTAURANT_ASSIGNED,
        null,
        { 
          assignment_count: responseData.result.assignment_count,
          restaurant_names: responseData.result.restaurant_names,
          expires_at: responseData.result.expires_at
        }
      );
    }

    // Check if a status record already exists for this order
    const { data: existingStatus } = await supabase
      .from('status')
      .select('order_id')
      .eq('order_id', orderId)
      .maybeSingle();

    // Only insert a new status record if one doesn't exist already
    if (!existingStatus) {
      await supabase.from('status').insert({
        order_id: orderId,
        status: OrderStatus.RESTAURANT_ASSIGNED,
        updated_by: 'system'
      });
    }

    return responseData;
  } catch (error) {
    console.error('Error sending order to webhook:', error);
    return { success: false, error: 'Failed to send order to webhook' };
  }
};
