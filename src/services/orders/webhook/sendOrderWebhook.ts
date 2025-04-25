import { supabase } from '@/integrations/supabase/client';
import { OrderAssignmentRequest, WebhookResponse, OrderStatus } from '@/types/webhook';
import { logApiCall } from '@/services/loggerService';

// Function URL
const WEBHOOK_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://hozgutjvbrljeijybnyg.supabase.co/functions/v1';

/**
 * Sends an order to the webhook for restaurant assignment
 */
export const sendOrderToWebhook = async (
  orderId: string,
  latitude: number,
  longitude: number,
  expiredReassignment = false
): Promise<WebhookResponse> => {
  try {
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

    const response = await fetch(`${WEBHOOK_URL}/order-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    
    // Log the response
    await logApiCall(`${WEBHOOK_URL}/order-webhook`, requestBody, responseData);

    if (!response.ok) {
      return { success: false, error: responseData.error || 'Webhook request failed' };
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
        status: OrderStatus.AWAITING_RESTAURANT,
        updated_by: 'system'
      });
    }

    return responseData;
  } catch (error) {
    return { success: false, error: 'Failed to send order to webhook' };
  }
};
