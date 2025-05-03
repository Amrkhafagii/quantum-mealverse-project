
import { supabase } from '@/integrations/supabase/client';
import { OrderAssignmentRequest } from '@/types/webhook';
import { useWebhook } from '@/hooks/useWebhook';

/**
 * Sends an order to the webhook service to find a restaurant
 */
export const sendOrderToWebhook = async (
  orderId: string,
  latitude: number,
  longitude: number,
  action: string = 'assign'
): Promise<boolean> => {
  try {
    // Create the webhook request object
    const webhookRequest: OrderAssignmentRequest = {
      order_id: orderId,
      latitude,
      longitude,
      action,
      // Add flag if this is a reassignment due to expiry
      expired_reassignment: action === 'reassign'
    };
    
    // Record the assignment attempt in the database
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        order_id: orderId,
        request_type: 'find_restaurant',
        request_data: webhookRequest
      });

    if (logError) {
      console.error('Error logging webhook request:', logError);
    }

    // Now send the actual webhook request
    const { callWebhook } = useWebhook();
    const response = await callWebhook('/find-restaurant', webhookRequest);
    
    if (!response.success) {
      console.error('Webhook error:', response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending order to webhook:', error);
    return false;
  }
};
