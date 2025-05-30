
import { supabase } from '@/integrations/supabase/client';
import { OrderAssignmentRequest } from '@/types/webhook';
import { useWebhook } from '@/hooks/useWebhook';

/**
 * Generates an idempotency key for webhook requests
 */
const generateIdempotencyKey = (orderId: string, action: string, attempt: number = 1): string => {
  const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  return `${orderId}_${action}_${attempt}_${timestamp}`;
};

/**
 * Checks if a webhook request with the same idempotency key has been processed recently
 */
const checkIdempotency = async (idempotencyKey: string): Promise<boolean> => {
  try {
    // Check for recent webhook logs with the same key (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .gte('created_at', fiveMinutesAgo)
      .limit(1);

    if (error) {
      console.error('Error checking idempotency:', error);
      return false; // Allow request if we can't check
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Critical error checking idempotency:', error);
    return false; // Allow request if we can't check
  }
};

/**
 * Logs webhook request with idempotency key
 */
const logWebhookRequest = async (
  webhookRequest: OrderAssignmentRequest, 
  idempotencyKey: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('webhook_logs')
      .insert({
        payload: {
          order_id: webhookRequest.order_id,
          request_type: 'find_restaurant',
          request_data: JSON.parse(JSON.stringify(webhookRequest))
        },
        idempotency_key: idempotencyKey
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
 * Sends an order to the webhook service to find a restaurant with idempotency handling
 */
export const sendOrderToWebhook = async (
  orderId: string,
  latitude: number,
  longitude: number,
  action: string = 'assign',
  attempt: number = 1
): Promise<boolean> => {
  try {
    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey(orderId, action, attempt);
    
    // Check if this request has been processed recently
    const isDuplicate = await checkIdempotency(idempotencyKey);
    if (isDuplicate) {
      console.log(`Duplicate webhook request detected for order ${orderId}, skipping`);
      return true; // Return success since it was already processed
    }

    // Create the webhook request object
    const webhookRequest: OrderAssignmentRequest = {
      order_id: orderId,
      latitude,
      longitude,
      action,
      expired_reassignment: action === 'reassign'
    };
    
    // Log the webhook request with idempotency key
    const loggingSuccess = await logWebhookRequest(webhookRequest, idempotencyKey);
    if (!loggingSuccess) {
      console.warn(`Failed to log webhook request for order ${orderId}, continuing anyway`);
    }

    // Send the actual webhook request
    const hookService = useWebhook();
    const response = await hookService.callWebhook('order-assignment', webhookRequest);
    
    if (!response.success) {
      console.error('Webhook error:', response.error);
      return false;
    }

    console.log(`Successfully sent order ${orderId} to webhook with idempotency key ${idempotencyKey}`);
    return true;
  } catch (error) {
    console.error('Error sending order to webhook:', error);
    return false;
  }
};

/**
 * Sends order to webhook with retry mechanism and idempotency
 */
export const sendOrderToWebhookWithRetry = async (
  orderId: string,
  latitude: number,
  longitude: number,
  action: string = 'assign',
  maxRetries: number = 3
): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const success = await sendOrderToWebhook(orderId, latitude, longitude, action, attempt);
      if (success) {
        return true;
      }
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retrying webhook request for order ${orderId}, attempt ${attempt + 1}`);
      }
    } catch (error) {
      console.error(`Webhook attempt ${attempt} failed for order ${orderId}:`, error);
    }
  }
  
  console.error(`All webhook attempts failed for order ${orderId}`);
  return false;
};
