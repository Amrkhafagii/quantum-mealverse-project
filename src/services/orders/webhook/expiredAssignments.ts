
import { supabase } from '@/integrations/supabase/client';
import { WebhookResponse } from '@/types/webhook';
import { logApiCall } from '@/services/loggerService';
import { recordOrderHistory } from './orderHistoryService';

const WEBHOOK_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://hozgutjvbrljeijybnyg.supabase.co/functions/v1';

/**
 * Makes a direct call to check and handle expired assignments
 * This is mainly used for syncing the client with the server state
 */
export const checkExpiredAssignments = async (): Promise<WebhookResponse> => {
  try {
    console.log('Calling checkExpiredAssignments webhook');
    
    // Get current session for authentication
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

    // Call our serverless function to check for expired assignments
    const response = await fetch(`${WEBHOOK_URL}/check-expired-assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        client_timestamp: new Date().toISOString(),
        force_check: true // Signal to force a check regardless of timing
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Check expired request failed:', response.status, errorText);
      return { 
        success: false, 
        error: `Check expired request failed: ${response.status} ${errorText}`
      };
    }

    const data = await response.json();
    console.log('Check expired response:', data);

    // Log the response
    await logApiCall(`${WEBHOOK_URL}/check-expired-assignments`, {}, data);

    return data;
  } catch (error) {
    console.error('Error checking expired assignments:', error);
    return { 
      success: false, 
      error: 'Failed to check expired assignments' 
    };
  }
};

/**
 * Client-side function to refresh the UI after an assignment expires
 * Does NOT directly modify database - just triggers server check and UI refresh
 */
export const forceExpireAssignments = async (orderId: string): Promise<WebhookResponse> => {
  try {
    console.log(`🔄 Refreshing order ${orderId} after assignment expiration`);
    
    // Call the server function to check for expired assignments
    const result = await checkExpiredAssignments();
    
    // Refresh the UI by informing the caller of the result
    return { 
      success: true, 
      message: `Refreshed server state for order ${orderId}`,
      result
    };
  } catch (error) {
    console.error('Error refreshing after assignment expiration:', error);
    return { success: false, error: 'Failed to refresh assignments' };
  }
};
