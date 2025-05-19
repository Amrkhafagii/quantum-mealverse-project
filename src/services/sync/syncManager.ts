
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { BackgroundSync, setupBackgroundSyncListeners, useBackgroundSync } from '@/utils/backgroundSync';
import { toast } from '@/components/ui/use-toast';
import { getPendingActions, clearAllPendingActions } from '@/utils/offlineStorage';
import { syncPendingActions } from '@/services/sync/syncService';
import { Platform } from '@/utils/platform';

// Initialize the sync system
export function initializeSyncSystem() {
  // Set up event listeners
  setupBackgroundSyncListeners(
    // On sync started
    () => {
      console.log("Background sync started");
      // You could update UI indicators here
    },
    // On sync completed
    () => {
      console.log("Background sync completed");
      // You could update UI indicators here
    }
  );
  
  // Listen for online/offline events to trigger syncs appropriately
  window.addEventListener('online', handleOnline);
}

// Cleanup function
export function cleanupSyncSystem() {
  window.removeEventListener('online', handleOnline);
  
  // Only call removeAllListeners on native platforms
  if (Platform.isNative()) {
    BackgroundSync.removeAllListeners().catch(err => {
      console.warn("Error removing background sync listeners:", err);
    });
  }
}

// When device comes online
function handleOnline() {
  getPendingActionsCount().then(count => {
    if (count > 0) {
      console.log(`Device is online with ${count} pending actions. Starting sync...`);
      performSync(false);
    }
  });
}

// Get number of pending actions
export async function getPendingActionsCount(): Promise<number> {
  const actions = await getPendingActions();
  return actions.length;
}

// Perform a sync operation
export async function performSync(showNotifications = true): Promise<boolean> {
  try {
    if (showNotifications) {
      const pendingCount = await getPendingActionsCount();
      if (pendingCount > 0) {
        toast({
          title: "Syncing data",
          description: `Processing ${pendingCount} pending ${pendingCount === 1 ? 'item' : 'items'}`,
        });
      }
    }
    
    await syncPendingActions();
    
    if (showNotifications) {
      toast({
        title: "Sync complete",
        description: "Your data has been synchronized",
      });
    }
    
    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    
    if (showNotifications) {
      toast({
        title: "Sync failed",
        description: "Could not synchronize your data. Will try again later.",
        variant: "destructive"
      });
    }
    
    return false;
  }
}

// Hook for components that need sync functionality
export function useSyncManager() {
  const { isOnline } = useConnectionStatus();
  const { scheduleSync, syncNow, getLastSyncTimestamp } = useBackgroundSync();
  
  const manualSync = async (): Promise<boolean> => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "You are currently offline. Sync will happen automatically when you're back online.",
        variant: "destructive" 
      });
      return false;
    }
    
    return performSync(true);
  };
  
  const scheduleBackgroundSync = async (immediate = false): Promise<void> => {
    if (Platform.isNative()) {
      try {
        if (immediate) {
          await syncNow();
        } else {
          await scheduleSync();
        }
      } catch (error) {
        console.error("Error scheduling background sync:", error);
        
        // Fallback to direct sync if plugin fails
        if (immediate && isOnline) {
          await performSync(false);
        }
      }
    } else {
      // For web platforms, we'll use our web fallback
      console.log("Web platform: Using direct sync instead of background sync");
      if (immediate && isOnline) {
        await performSync(false);
      }
    }
  };
  
  return {
    manualSync,
    scheduleBackgroundSync,
    getPendingActionsCount,
    getLastSyncTimestamp,
    clearAllPendingActions,
  };
}
