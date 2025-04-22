
import { supabase } from '@/integrations/supabase/client';
import { WebhookResponse } from '@/types/webhook';
import { logApiCall } from '@/services/loggerService';

const WEBHOOK_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://hozgutjvbrljeijybnyg.supabase.co/functions/v1';

/**
 * Makes a passive call to get the latest state from the server
 * Does NOT force any changes to the database
 */
export const checkExpiredAssignments = async (): Promise<WebhookResponse> => {
  try {
    console.log('Fetching latest state from server');
    
    // Get current session for authentication
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

    // Call our serverless function to get the current state without forcing changes
    const response = await fetch(`${WEBHOOK_URL}/check-expired-assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        client_timestamp: new Date().toISOString(),
        force_check: false // Don't force any changes, just get current state
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server state check failed:', response.status, errorText);
      return { 
        success: false, 
        error: `Server state check failed: ${response.status} ${errorText}`
      };
    }

    const data = await response.json();
    console.log('Server state check response:', data);

    // Log the response
    await logApiCall(`${WEBHOOK_URL}/check-expired-assignments`, {}, data);

    return data;
  } catch (error) {
    console.error('Error checking server state:', error);
    return { 
      success: false, 
      error: 'Failed to check server state' 
    };
  }
};

/**
 * Client-side function to refresh the UI only
 * Does NOT modify the database at all
 */
export const forceExpireAssignments = async (orderId: string): Promise<WebhookResponse> => {
  try {
    console.log(`🔄 Refreshing UI for order ${orderId}`);
    
    // Just return success immediately - no server changes
    return { 
      success: true, 
      message: `UI refreshed for order ${orderId}`,
    };
  } catch (error) {
    console.error('Error refreshing UI:', error);
    return { success: false, error: 'Failed to refresh UI' };
  }
};
