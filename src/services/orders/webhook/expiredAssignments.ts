
import { supabase } from '@/integrations/supabase/client';
import { WebhookResponse } from '@/types/webhook';
import { logApiCall } from '@/services/loggerService';
import { recordOrderHistory } from './orderHistoryService';

const WEBHOOK_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://hozgutjvbrljeijybnyg.supabase.co/functions/v1';

/**
 * Makes a direct call to check and handle expired assignments
 */
export const checkExpiredAssignments = async (): Promise<WebhookResponse> => {
  try {
    console.log('Calling checkExpiredAssignments webhook');
    
    // Get current session for authentication
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

    // Call our new serverless function to check for expired assignments
    const response = await fetch(`${WEBHOOK_URL}/check-expired-assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        client_timestamp: new Date().toISOString()
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
 * Manually handles expired assignments for a specific order
 */
export const forceExpireAssignments = async (orderId: string): Promise<WebhookResponse> => {
  try {
    console.log(`🔥 Forcing expiration of assignments for order ${orderId}`);
    
    // First, get all pending assignments for this order
    const { data: pendingAssignments, error: fetchError } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, expires_at')
      .eq('order_id', orderId)
      .eq('status', 'pending');
    
    if (fetchError) {
      console.error('Error fetching pending assignments:', fetchError);
      return { success: false, error: 'Failed to fetch pending assignments' };
    }
    
    if (!pendingAssignments || pendingAssignments.length === 0) {
      console.log(`No pending assignments found for order ${orderId}`);
      
      // Check if there are any accepted assignments
      const { data: acceptedAssignments } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', orderId)
        .eq('status', 'accepted');
      
      if (!acceptedAssignments || acceptedAssignments.length === 0) {
        // No accepted assignments either, update order status
        console.log(`No accepted assignments for order ${orderId}, updating status`);
        
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({ status: 'no_restaurant_accepted' })
          .eq('id', orderId);
          
        if (orderUpdateError) {
          console.error('Error updating order status:', orderUpdateError);
        } else {
          await recordOrderHistory(
            orderId,
            'no_restaurant_accepted',
            null,
            { reason: 'No restaurants accepted the order' }
          );
        }
      }
      
      return { success: true, message: 'No pending assignments found' };
    }
    
    // This now just calls the server-side function to handle the expiration
    const result = await checkExpiredAssignments();
    
    return { 
      success: true, 
      message: `Requested server to expire assignments for order ${orderId}`,
      result
    };
  } catch (error) {
    console.error('Error forcing assignment expiration:', error);
    return { success: false, error: 'Failed to expire assignments' };
  }
};
