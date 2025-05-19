
import { getPendingActions, removePendingAction, incrementRetryCount, hasExceededRetryLimit, cancelOrderWithOfflineSupport } from '@/utils/offlineStorage';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { toast } from 'sonner';

// Mock API function - in a real app, you'd have actual API calls here
const processAction = async (action: any) => {
  console.log(`Processing action: ${action.type}`);
  // This would be a real API call in production
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      // Simulate success 80% of the time
      const isSuccessful = Math.random() < 0.8;
      resolve(isSuccessful);
    }, 300);
  });
};

// This function would sync any pending offline actions with the server
export const syncPendingActions = async (): Promise<void> => {
  // Get connection status
  const isOnline = navigator.onLine;
  
  if (!isOnline) {
    console.log('Cannot sync - device is offline');
    return;
  }
  
  try {
    // Get all pending actions
    const pendingActions = await getPendingActions();
    
    if (pendingActions.length === 0) {
      console.log('No pending actions to sync');
      return;
    }
    
    console.log(`Syncing ${pendingActions.length} pending actions...`);
    toast.info(`Syncing ${pendingActions.length} pending actions...`);
    
    // Process each action
    for (const action of pendingActions) {
      try {
        const isSuccessful = await processAction(action);
        
        if (isSuccessful) {
          // If successful, remove the action from the pending queue
          await removePendingAction(action.id);
          console.log(`Successfully processed action: ${action.type}`);
        } else {
          // If failed, increment retry count
          await incrementRetryCount(action.id);
          
          // Check if we've exceeded retry limit
          const hasExceeded = await hasExceededRetryLimit(action.id);
          
          if (hasExceeded) {
            console.error(`Action ${action.type} (${action.id}) has exceeded retry limit. Removing from queue.`);
            await removePendingAction(action.id);
            toast.error(`Failed to sync: ${action.type}. Retry limit exceeded.`);
          } else {
            console.log(`Failed to process action: ${action.type}. Will retry later.`);
          }
        }
      } catch (error) {
        console.error(`Error processing action ${action.id}:`, error);
      }
    }
    
    // Get remaining actions after sync attempt
    const remainingActions = await getPendingActions();
    
    if (remainingActions.length === 0) {
      toast.success('All actions synced successfully');
    } else {
      toast.warning(`${remainingActions.length} actions failed to sync. Will retry later.`);
    }
  } catch (error) {
    console.error('Error during sync process:', error);
    toast.error('Error syncing data. Please try again.');
  }
};

// Function to check if there are pending actions
export const hasPendingActions = async (): Promise<boolean> => {
  try {
    const actions = await getPendingActions();
    return actions.length > 0;
  } catch (error) {
    console.error('Error checking for pending actions:', error);
    return false;
  }
};

// Fix for the CancelOrderButton component
export { cancelOrderWithOfflineSupport };

export default { syncPendingActions, hasPendingActions, cancelOrderWithOfflineSupport };
