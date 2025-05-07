
import { toast } from '@/hooks/use-toast';
import { getPendingActions, removePendingAction, incrementRetryCount, hasExceededRetryLimit } from '@/utils/offlineStorage';

// Create a minimal implementation of updateOrderStatus 
const updateOrderStatus = async (
  orderId: string, 
  newStatus: string, 
  restaurantId: string, 
  details?: Record<string, unknown>
): Promise<boolean> => {
  try {
    // Implementation would normally go here to update the order status
    // This is a placeholder that would be replaced with the real implementation
    console.log(`Updating order ${orderId} to ${newStatus} for restaurant ${restaurantId}`);
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

// Create a minimal implementation of cancelOrder
const cancelOrder = async (orderId: string): Promise<boolean> => {
  try {
    // Implementation would normally go here to cancel the order
    // This is a placeholder that would be replaced with the real implementation
    console.log(`Cancelling order ${orderId}`);
    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
    return false;
  }
};

// Process all pending actions when coming back online
export const syncPendingActions = async (): Promise<void> => {
  const pendingActions = getPendingActions();
  
  if (pendingActions.length === 0) {
    return;
  }
  
  toast({
    title: "Synchronizing",
    description: `Processing ${pendingActions.length} pending ${pendingActions.length === 1 ? 'action' : 'actions'}...`,
  });
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const action of pendingActions) {
    try {
      let success = false;
      
      switch (action.type) {
        case 'UPDATE_ORDER_STATUS':
          success = await updateOrderStatus(
            action.payload.orderId,
            action.payload.newStatus,
            action.payload.restaurantId,
            action.payload.details
          );
          break;
          
        case 'CANCEL_ORDER':
          success = await cancelOrder(action.payload.orderId);
          break;
          
        // Add more action types as needed
      }
      
      if (success) {
        removePendingAction(action.id);
        successCount++;
      } else {
        incrementRetryCount(action.id);
        if (hasExceededRetryLimit(action.id)) {
          removePendingAction(action.id);
          failureCount++;
        }
      }
    } catch (error) {
      console.error(`Error processing action ${action.type}:`, error);
      incrementRetryCount(action.id);
      if (hasExceededRetryLimit(action.id)) {
        removePendingAction(action.id);
        failureCount++;
      }
    }
  }
  
  if (successCount > 0 || failureCount > 0) {
    toast({
      title: "Synchronization Complete",
      description: `Successfully processed ${successCount} ${successCount === 1 ? 'action' : 'actions'}${failureCount > 0 ? `. Failed to process ${failureCount} ${failureCount === 1 ? 'action' : 'actions'}.` : '.'}`,
      variant: failureCount > 0 ? "destructive" : "default",
    });
  }
};

// Enhanced order status update function with offline support
export const updateOrderStatusWithOfflineSupport = async (
  orderId: string,
  newStatus: string,
  restaurantId: string,
  details?: Record<string, unknown>
): Promise<boolean> => {
  // Use navigator.onLine instead of window.navigator.isOnline
  const isOnline = navigator.onLine;
  
  if (!isOnline) {
    // Queue the action for later
    import('@/utils/offlineStorage').then(({ queueOfflineAction }) => {
      queueOfflineAction({
        type: 'UPDATE_ORDER_STATUS',
        payload: { orderId, newStatus, restaurantId, details }
      });
      
      toast({
        title: "Offline Action Queued",
        description: `Your order status update will be processed when you're back online.`,
        variant: "default",
      });
    });
    return true; // Optimistically return success
  }
  
  // If online, proceed with normal update
  return updateOrderStatus(orderId, newStatus, restaurantId, details);
};

// Enhanced cancel order function with offline support
export const cancelOrderWithOfflineSupport = async (orderId: string): Promise<boolean> => {
  // Use navigator.onLine instead of window.navigator.isOnline
  const isOnline = navigator.onLine;
  
  if (!isOnline) {
    // Queue the action for later
    import('@/utils/offlineStorage').then(({ queueOfflineAction }) => {
      queueOfflineAction({
        type: 'CANCEL_ORDER',
        payload: { orderId }
      });
      
      toast({
        title: "Offline Action Queued",
        description: `Your order cancellation will be processed when you're back online.`,
        variant: "default",
      });
    });
    return true; // Optimistically return success
  }
  
  // If online, proceed with normal cancellation
  return cancelOrder(orderId);
};
