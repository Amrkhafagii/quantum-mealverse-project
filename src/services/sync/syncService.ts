
import { toast } from '@/hooks/use-toast';
import { getPendingActions, removePendingAction, incrementRetryCount, hasExceededRetryLimit } from '@/utils/offlineStorage';
import { updateOrderStatus } from '@/services/orders/orderService';
import { cancelOrder } from '@/services/orders/orderService';

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
  const { isOnline } = window.navigator;
  
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
  const { isOnline } = window.navigator;
  
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
