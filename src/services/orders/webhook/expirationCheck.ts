
import { supabase } from '@/integrations/supabase/client';
import { WebhookResponse } from '@/types/webhook';
import { logApiCall } from '@/services/loggerService';
import { recordOrderHistory } from './orderHistory';

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

    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

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
      const errorText = await response.text();
      console.error('Check expired request failed:', response.status, errorText);
      return { 
        success: false, 
        error: `Check expired request failed: ${response.status} ${errorText}`
      };
    }

    const data = await response.json();
    console.log('Check expired response:', data);

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
    console.log(`Forcing expiration of assignments for order ${orderId}`);
    
    const { data: pendingAssignments, error: fetchError } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id')
      .eq('order_id', orderId)
      .eq('status', 'pending');
    
    if (fetchError) {
      console.error('Error fetching pending assignments:', fetchError);
      return { success: false, error: 'Failed to fetch pending assignments' };
    }
    
    if (!pendingAssignments || pendingAssignments.length === 0) {
      return { success: true, message: 'No pending assignments found' };
    }
    
    console.log(`Found ${pendingAssignments.length} pending assignments to expire`);
    
    const updates = pendingAssignments.map(async (assignment) => {
      const { error: updateError } = await supabase
        .from('restaurant_assignments')
        .update({ status: 'expired' })
        .eq('id', assignment.id);
      
      if (updateError) {
        console.error(`Error updating assignment ${assignment.id}:`, updateError);
        return false;
      }
      
      const { error: historyError } = await supabase
        .from('restaurant_assignment_history')
        .insert({
          order_id: orderId,
          restaurant_id: assignment.restaurant_id,
          status: 'expired',
          notes: 'Manually expired by frontend timer'
        });
      
      if (historyError) {
        console.error(`Error adding to history for assignment ${assignment.id}:`, historyError);
      }
      
      await recordOrderHistory(
        orderId,
        'assignment_expired',
        assignment.restaurant_id,
        { assignment_id: assignment.id, forced: true },
        new Date().toISOString()
      );
      
      return true;
    });
    
    const results = await Promise.all(updates);
    const successCount = results.filter(r => r).length;
    
    const { data: remainingPending } = await supabase
      .from('restaurant_assignments')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'pending');
    
    if (!remainingPending || remainingPending.length === 0) {
      const { data: acceptedAssignments } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', orderId)
        .eq('status', 'accepted');
        
      const noAcceptedAssignments = !acceptedAssignments || acceptedAssignments.length === 0;
        
      if (noAcceptedAssignments) {
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
            { reason: 'All restaurant assignments expired or were manually expired' }
          );
        }
      }
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
