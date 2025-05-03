import { sendOrderToWebhook } from './webhook/sendOrderWebhook';
import { getAssignmentStatus } from './webhook/assignmentStatus';
import { recordOrderHistory } from './webhook/orderHistoryService';
import { OrderStatus } from '@/types/webhook';
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates an order status and records the change in history
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  restaurantId: string | null,
  details?: Record<string, unknown>,
  changedBy?: string,
  changedByType: 'system' | 'customer' | 'restaurant' | 'admin' = 'system'
): Promise<boolean> => {
  try {
    console.log(`Updating order ${orderId} status to ${newStatus}`);
    
    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (updateError) {
      console.error('Failed to update order status:', updateError);
      return false;
    }
    
    // Record to order history
    await recordOrderHistory(
      orderId,
      newStatus,
      restaurantId,
      details,
      undefined,
      changedBy,
      changedByType
    );
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

// For backwards compatibility - export getAssignmentStatus as checkAssignmentStatus
export const checkAssignmentStatus = getAssignmentStatus;

// Re-export the functions for external use
export {
  sendOrderToWebhook,
  getAssignmentStatus
};
