
import offlineStorage from './factory';
import { getPendingActions, queueOfflineAction, removePendingAction, clearAllPendingActions } from './actionsService';
import { getActiveOrders, storeActiveOrder, getActiveOrder } from './ordersService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Sync all pending actions with the server
 */
export const syncPendingActions = async (): Promise<void> => {
  try {
    const pendingActions = await getPendingActions();
    
    if (pendingActions.length === 0) {
      return;
    }
    
    console.log(`Syncing ${pendingActions.length} pending actions...`);
    
    for (const action of pendingActions) {
      try {
        if (action.type === 'cancel_order') {
          // Process order cancellation
          const { orderId } = action.payload;
          const { error } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId);
          
          if (error) {
            console.error("Error syncing cancel order action:", error);
            continue;
          }
          
          // Remove action after successful processing
          await removePendingAction(action.id);
        }
        
        // Add other action type handlers here in the future
        
      } catch (error) {
        console.error(`Error processing action ${action.id}:`, error);
      }
    }
    
    console.log("Sync completed");
  } catch (error) {
    console.error("Error syncing pending actions:", error);
    throw error;
  }
};

/**
 * Cancel an order with offline support
 * Used for optimistic UI updates when offline
 */
export const cancelOrderWithOfflineSupport = async (orderId: string): Promise<void> => {
  try {
    // Update the local active order cache
    const order = await getActiveOrder(orderId);
    if (order) {
      order.status = 'cancelled';
      await storeActiveOrder(order);
    }
  } catch (error) {
    console.error("Error updating local order state:", error);
  }
};

export { 
  offlineStorage as default,
  getPendingActions,
  queueOfflineAction,
  removePendingAction,
  clearAllPendingActions,
  getActiveOrders,
  storeActiveOrder,
  getActiveOrder
};
