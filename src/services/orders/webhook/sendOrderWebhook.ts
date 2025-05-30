
import { supabase } from '@/integrations/supabase/client';

// Simple local interface to avoid type complexity
interface SimpleOrderAssignmentRequest {
  order_id: string;
  latitude: number;
  longitude: number;
  action: string;
  expired_reassignment?: boolean;
}

const WEBHOOK_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://hozgutjvbrljeijybnyg.supabase.co/functions/v1';

/**
 * Generates an idempotency key for webhook requests
 * @param orderId - The order ID
 * @param action - The action being performed
 * @param attempt - The attempt number
 * @returns A unique idempotency key
 */
const generateIdempotencyKey = (orderId: string, action: string, attempt: number = 1): string => {
  const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  return `${orderId}_${action}_${attempt}_${timestamp}`;
};

/**
 * Checks if a webhook request with the same idempotency key has been processed recently
 * @param idempotencyKey - The idempotency key to check
 * @returns Promise<boolean> - True if duplicate, false otherwise
 */
const checkIdempotency = async (idempotencyKey: string): Promise<boolean> => {
  try {
    console.log(`Checking idempotency for key: ${idempotencyKey}`);
    
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

    const isDuplicate = Boolean(data && data.length > 0);
    console.log(`Idempotency check result: ${isDuplicate ? 'duplicate' : 'unique'}`);
    return isDuplicate;
  } catch (error) {
    console.error('Critical error checking idempotency:', error);
    return false; // Allow request if we can't check
  }
};

/**
 * Logs webhook request with idempotency key
 * @param webhookRequest - The webhook request object
 * @param idempotencyKey - The idempotency key
 * @returns Promise<boolean> - Success status
 */
const logWebhookRequest = async (
  webhookRequest: SimpleOrderAssignmentRequest, 
  idempotencyKey: string
): Promise<boolean> => {
  try {
    console.log(`Logging webhook request for order ${webhookRequest.order_id} with key: ${idempotencyKey}`);
    
    const { error } = await supabase
      .from('webhook_logs')
      .insert({
        payload: {
          order_id: webhookRequest.order_id,
          request_type: 'find_restaurant',
          request_data: webhookRequest
        },
        idempotency_key: idempotencyKey
      });

    if (error) {
      console.error('Error logging webhook request:', error);
      return false;
    }
    
    console.log('Successfully logged webhook request');
    return true;
  } catch (error) {
    console.error('Critical error logging webhook request:', error);
    return false;
  }
};

/**
 * Calls webhook directly without using React hooks
 * @param payload - The webhook payload
 * @returns Promise with success status and optional error message
 */
const callWebhook = async (payload: SimpleOrderAssignmentRequest): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Calling webhook for order ${payload.order_id} with action: ${payload.action}`);
    
    // Get current session for authentication
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

    if (!token) {
      console.error('No authentication token available');
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${WEBHOOK_URL}/order-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Webhook call failed with status ${response.status}: ${errorText}`);
      return { success: false, error: `Webhook request failed: ${response.status}` };
    }

    console.log('Webhook call completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in webhook call:', error);
    return { success: false, error: 'Failed to call webhook' };
  }
};

/**
 * Sends an order to the webhook service to find a restaurant with idempotency handling
 * @param orderId - The order ID
 * @param latitude - Customer latitude
 * @param longitude - Customer longitude
 * @param action - The action to perform (default: 'assign')
 * @param attempt - The attempt number (default: 1)
 * @returns Promise<boolean> - Success status
 */
export const sendOrderToWebhook = async (
  orderId: string,
  latitude: number,
  longitude: number,
  action: string = 'assign',
  attempt: number = 1
): Promise<boolean> => {
  try {
    console.log(`Starting webhook process for order ${orderId} - attempt ${attempt}, action: ${action}`);
    
    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey(orderId, action, attempt);
    
    // Check if this request has been processed recently
    const isDuplicate = await checkIdempotency(idempotencyKey);
    if (isDuplicate) {
      console.log(`Duplicate webhook request detected for order ${orderId}, skipping`);
      return true; // Return success since it was already processed
    }

    // Create the webhook request object
    const webhookRequest: SimpleOrderAssignmentRequest = {
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
    const response = await callWebhook(webhookRequest);
    
    if (!response.success) {
      console.error(`Webhook failed for order ${orderId}:`, response.error);
      return false;
    }

    console.log(`Successfully sent order ${orderId} to webhook with idempotency key ${idempotencyKey}`);
    return true;
  } catch (error) {
    console.error(`Critical error sending order ${orderId} to webhook:`, error);
    return false;
  }
};

/**
 * Sends order to webhook with retry mechanism and idempotency
 * @param orderId - The order ID
 * @param latitude - Customer latitude
 * @param longitude - Customer longitude
 * @param action - The action to perform (default: 'assign')
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise<boolean> - Success status
 */
export const sendOrderToWebhookWithRetry = async (
  orderId: string,
  latitude: number,
  longitude: number,
  action: string = 'assign',
  maxRetries: number = 3
): Promise<boolean> => {
  console.log(`Starting webhook with retry for order ${orderId} - max retries: ${maxRetries}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Webhook attempt ${attempt}/${maxRetries} for order ${orderId}`);
      
      const success = await sendOrderToWebhook(orderId, latitude, longitude, action, attempt);
      if (success) {
        console.log(`Webhook successful on attempt ${attempt} for order ${orderId}`);
        return true;
      }
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying webhook for order ${orderId} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Webhook attempt ${attempt} failed for order ${orderId}:`, error);
    }
  }
  
  console.error(`All ${maxRetries} webhook attempts failed for order ${orderId}`);
  return false;
};
