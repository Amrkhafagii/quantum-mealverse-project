
import { supabase } from '@/services/supabaseClient';
import { getPendingActions, removePendingAction, incrementRetryCount, hasExceededRetryLimit } from '@/utils/offlineStorage/index';
import { toast } from '@/components/ui/use-toast';

// Define backoff strategies for retries
const getBackoffTime = (retryCount: number): number => {
  // Exponential backoff: 2^n * 1000ms with a max of 30 minutes
  return Math.min(Math.pow(2, retryCount) * 1000, 30 * 60 * 1000);
};

/**
 * Synchronize offline data with the server
 * @param showNotifications Whether to show toast notifications
 */
export const syncOfflineData = async (showNotifications = false): Promise<boolean> => {
  try {
    const pendingActions = await getPendingActions();
    
    if (pendingActions.length === 0) {
      console.log('No pending actions to sync');
      return true;
    }
    
    console.log(`Syncing ${pendingActions.length} pending actions`);
    
    if (showNotifications) {
      toast({
        title: "Syncing data",
        description: `Processing ${pendingActions.length} pending ${pendingActions.length === 1 ? 'action' : 'actions'}`,
      });
    }
    
    let success = true;
    // Process each action
    for (const action of pendingActions) {
      try {
        console.log(`Processing action: ${action.type}`, action.payload);
        
        // Handle different action types
        switch (action.type) {
          case 'create_order':
            await processCreateOrder(action.payload);
            break;
          case 'update_order':
            await processUpdateOrder(action.payload);
            break;
          case 'cancel_order':
            await processCancelOrder(action.payload);
            break;
          default:
            console.warn(`Unknown action type: ${action.type}`);
            // Skip unknown actions
            await removePendingAction(action.id);
            continue;
        }
        
        // Remove processed action
        await removePendingAction(action.id);
      } catch (error) {
        console.error(`Error processing action ${action.id}:`, error);
        success = false;
        
        // Increment retry count
        await incrementRetryCount(action.id);
        
        // Check if we've exceeded retry limit
        if (await hasExceededRetryLimit(action.id)) {
          console.warn(`Action ${action.id} exceeded retry limit, removing`);
          if (showNotifications) {
            toast({
              title: "Sync action failed",
              description: `Action ${action.type} could not be completed after multiple attempts`,
              variant: "destructive"
            });
          }
          await removePendingAction(action.id);
        } else {
          // Schedule a retry with exponential backoff
          const retryCount = action.retryCount || 0;
          const backoffTime = getBackoffTime(retryCount);
          
          console.log(`Will retry action ${action.id} in ${backoffTime/1000} seconds`);
          
          // In a real app, we would use a more robust retry mechanism
          // This is just a simple implementation for demonstration
          setTimeout(() => {
            syncOfflineData();
          }, backoffTime);
        }
      }
    }
    
    if (showNotifications && success) {
      toast({
        title: "Sync complete",
        description: "Your data has been synchronized",
      });
    }
    
    return success;
  } catch (error) {
    console.error('Error syncing offline data:', error);
    
    if (showNotifications) {
      toast({
        title: "Sync failed",
        description: "Could not synchronize your data. Will try again later.",
        variant: "destructive"
      });
    }
    
    return false;
  }
};

// Implementation for creating orders
const processCreateOrder = async (payload: any) => {
  console.log('Creating order from offline queue:', payload);
  
  // Check for conflicts (e.g., if the order was already created)
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('client_reference_id', payload.client_reference_id)
    .maybeSingle();
  
  if (existingOrder) {
    console.log('Order already exists, skipping create', existingOrder);
    return;
  }
  
  // Create the order in the database
  const { data, error } = await supabase
    .from('orders')
    .insert(payload)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  return data;
};

// Implementation for updating orders
const processUpdateOrder = async (payload: any) => {
  console.log('Updating order from offline queue:', payload);
  
  // Handle conflicts - check for last_modified timestamp to implement optimistic concurrency control
  if (payload.last_modified) {
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('last_modified')
      .eq('id', payload.id)
      .single();
    
    if (currentOrder && new Date(currentOrder.last_modified) > new Date(payload.last_modified)) {
      console.warn('Conflict detected: server has newer version of order', payload.id);
      // Implement your conflict resolution strategy here
      // For now, we'll let the server win in case of conflicts
      throw new Error('Conflict: server has newer version');
    }
  }
  
  // Update the order in the database
  const { id, ...updateData } = payload;
  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating order:', error);
    throw error;
  }
  
  return data;
};

// Implementation for canceling orders
const processCancelOrder = async (payload: any) => {
  console.log('Cancelling order from offline queue:', payload);
  
  // Simple implementation - in a real app you might have more complex logic
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', payload.orderId)
    .select()
    .single();
  
  if (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
  
  return data;
};

// Alias for backward compatibility
export const syncPendingActions = syncOfflineData;
