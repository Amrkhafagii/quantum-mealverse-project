
import { supabase } from '@/integrations/supabase/client';
import { getPendingActions, removePendingAction, getCachedOrders, clearCachedOrder } from '@/utils/locationUtils';
import { toast } from '@/components/ui/use-toast';

export enum ActionType {
  CANCEL_ORDER = 'CANCEL_ORDER',
  UPDATE_ORDER_STATUS = 'UPDATE_ORDER_STATUS',
  SUBMIT_REVIEW = 'SUBMIT_REVIEW',
  UPDATE_LOCATION = 'UPDATE_LOCATION',
}

/**
 * Process all pending actions when connection is restored
 */
export const syncPendingActions = async (): Promise<boolean> => {
  const pendingActions = getPendingActions();
  
  if (pendingActions.length === 0) {
    return true;
  }

  let successCount = 0;
  const totalActions = pendingActions.length;

  console.log(`Processing ${totalActions} pending actions`);
  
  for (const action of pendingActions) {
    try {
      let success = false;
      
      switch (action.type) {
        case ActionType.CANCEL_ORDER:
          success = await processCancelOrder(action.payload);
          break;
        case ActionType.UPDATE_ORDER_STATUS:
          success = await processUpdateOrderStatus(action.payload);
          break;
        case ActionType.SUBMIT_REVIEW:
          success = await processSubmitReview(action.payload);
          break;
        case ActionType.UPDATE_LOCATION:
          success = await processUpdateLocation(action.payload);
          break;
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
      
      if (success) {
        await removePendingAction(action.id);
        successCount++;
      }
    } catch (error) {
      console.error(`Error processing action ${action.type}:`, error);
    }
  }
  
  const allSucceeded = successCount === totalActions;
  
  if (successCount > 0) {
    toast({
      title: allSucceeded ? 'All pending actions synchronized' : 'Some actions synchronized',
      description: `${successCount}/${totalActions} actions completed successfully`,
      variant: allSucceeded ? 'default' : 'destructive' // Changed from "warning" to "destructive" to fix the type error
    });
  }
  
  return allSucceeded;
};

/**
 * Process a cancel order action
 */
async function processCancelOrder(payload: { orderId: string }): Promise<boolean> {
  try {
    const { orderId } = payload;
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    if (error) throw error;
    
    // Clear the cached order since it's been updated on the server
    clearCachedOrder(orderId);
    
    return true;
  } catch (error) {
    console.error('Error processing cancel order action:', error);
    return false;
  }
}

/**
 * Process an update order status action
 */
async function processUpdateOrderStatus(payload: { orderId: string, status: string }): Promise<boolean> {
  try {
    const { orderId, status } = payload;
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    if (error) throw error;
    
    // Clear the cached order since it's been updated on the server
    clearCachedOrder(orderId);
    
    return true;
  } catch (error) {
    console.error('Error processing update order status action:', error);
    return false;
  }
}

/**
 * Process a submit review action
 */
async function processSubmitReview(payload: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .insert([payload]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error processing submit review action:', error);
    return false;
  }
}

/**
 * Process an update location action
 */
async function processUpdateLocation(payload: { userId: string, latitude: number, longitude: number }): Promise<boolean> {
  try {
    const { userId, latitude, longitude } = payload;
    
    const { error } = await supabase
      .from('user_locations')
      .upsert({
        user_id: userId,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error processing update location action:', error);
    return false;
  }
}

/**
 * Create a connection recovery handler
 */
export const createConnectionRecoveryHandler = (isOnline: boolean) => {
  let previousOnlineState = isOnline;
  
  return (currentOnlineState: boolean) => {
    // If we're transitioning from offline to online
    if (!previousOnlineState && currentOnlineState) {
      console.log('Connection restored, syncing pending actions');
      syncPendingActions();
    }
    
    previousOnlineState = currentOnlineState;
  };
};
