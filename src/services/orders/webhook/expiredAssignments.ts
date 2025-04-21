
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
    const requestBody = {
      action: 'check_expired'
    };

    // Get current session for authentication
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

    // Log the request before sending
    await logApiCall(`${WEBHOOK_URL}/order-webhook`, requestBody, null);

    // Add timestamp to request for debugging
    const requestWithTimestamp = {
      ...requestBody,
      client_timestamp: new Date().toISOString(),
      timezone_offset: new Date().getTimezoneOffset()
    };

    console.log('Sending webhook request with timestamp:', requestWithTimestamp);

    const response = await fetch(`${WEBHOOK_URL}/order-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestWithTimestamp),
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
    await logApiCall(`${WEBHOOK_URL}/order-webhook`, requestBody, data);

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
    
    console.log(`Found ${pendingAssignments.length} pending assignments for order ${orderId}`);
    
    // Debug: Log each assignment with expiration time
    const now = new Date();
    console.log(`Current time for comparison: ${now.toISOString()}`);
    pendingAssignments.forEach(assignment => {
      const expiresAt = new Date(assignment.expires_at);
      const diffMs = expiresAt.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      console.log(`Assignment ${assignment.id}: expires at ${assignment.expires_at}`);
      console.log(`Time difference: ${diffMins} minutes (${diffMs}ms)`);
      console.log(`Has expired: ${expiresAt < now ? 'YES' : 'NO'}`);
    });
    
    // Direct database update - Update status to expired for ALL pending assignments
    // regardless of actual expiration time to ensure they get processed
    const updates = pendingAssignments.map(async (assignment) => {
      console.log(`Updating assignment ${assignment.id} to expired status`);
      
      // First try an update with a direct query
      const { error: updateError } = await supabase
        .from('restaurant_assignments')
        .update({ 
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', assignment.id)
        .eq('status', 'pending'); // Only update if still pending
      
      if (updateError) {
        console.error(`Error updating assignment ${assignment.id}:`, updateError);
        return false;
      }
      
      console.log(`Successfully marked assignment ${assignment.id} as expired`);
      
      // Record in restaurant_assignment_history
      try {
        await supabase
          .from('restaurant_assignment_history')
          .insert({
            order_id: orderId,
            restaurant_id: assignment.restaurant_id,
            status: 'expired',
            notes: 'Force expired by timer'
          });
        console.log(`Added history entry for assignment ${assignment.id}`);
      } catch (historyError) {
        console.error(`Error recording assignment history for ${assignment.id}:`, historyError);
      }
      
      // Record in order history
      try {
        await recordOrderHistory(
          orderId,
          'assignment_expired',
          assignment.restaurant_id,
          { assignment_id: assignment.id, forced: true },
          new Date().toISOString()
        );
        console.log(`Added order history entry for assignment ${assignment.id}`);
      } catch (historyError) {
        console.error(`Error recording order history for assignment ${assignment.id}:`, historyError);
      }
      
      return true;
    });
    
    const results = await Promise.all(updates);
    const successCount = results.filter(r => r).length;
    
    // Check if all pending assignments are now expired
    const { data: remainingPending, error: checkError } = await supabase
      .from('restaurant_assignments')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'pending');
    
    if (checkError) {
      console.error('Error checking remaining pending assignments:', checkError);
    }
    
    console.log(`After updates: ${remainingPending?.length || 0} pending assignments remain`);
    
    if (!remainingPending || remainingPending.length === 0) {
      console.log('No more pending assignments, checking for accepted assignments');
      
      const { data: acceptedAssignments, error: acceptedError } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', orderId)
        .eq('status', 'accepted');
        
      if (acceptedError) {
        console.error('Error checking accepted assignments:', acceptedError);
      }
      
      const noAcceptedAssignments = !acceptedAssignments || acceptedAssignments.length === 0;
      console.log(`Accepted assignments: ${acceptedAssignments?.length || 0}`);
        
      if (noAcceptedAssignments) {
        console.log(`Updating order ${orderId} status to no_restaurant_accepted`);
        
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({ status: 'no_restaurant_accepted' })
          .eq('id', orderId);
          
        if (orderUpdateError) {
          console.error('Error updating order status:', orderUpdateError);
        } else {
          console.log(`Successfully updated order ${orderId} status to no_restaurant_accepted`);
          
          await recordOrderHistory(
            orderId,
            'no_restaurant_accepted',
            null,
            { reason: 'All restaurant assignments expired or were manually expired' }
          );
          console.log(`Added history entry for order status change`);
        }
      }
    }
    
    // Try to directly call the webhook as well, as a backup
    try {
      console.log('Calling webhook as additional verification');
      await checkExpiredAssignments();
    } catch (webhookError) {
      console.error('Error calling webhook:', webhookError);
    }
    
    return { 
      success: true, 
      message: `Expired ${successCount} of ${pendingAssignments.length} assignments` 
    };
  } catch (error) {
    console.error('Error forcing assignment expiration:', error);
    return { success: false, error: 'Failed to expire assignments' };
  }
};
