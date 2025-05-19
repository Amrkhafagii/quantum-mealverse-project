
import { BackgroundSync } from '@/utils/backgroundSync';
import { Platform } from '@/utils/platform';
import { syncPendingActions, getLastSyncTimestamp, getSyncQueue } from './syncService';

let syncSystemInitialized = false;

/**
 * Initialize the sync system
 */
export const initializeSyncSystem = () => {
  if (syncSystemInitialized) {
    return;
  }

  // Add event listeners for sync events
  setupSyncEventListeners();

  syncSystemInitialized = true;
  console.log('Sync system initialized');
};

/**
 * Clean up the sync system
 */
export const cleanupSyncSystem = () => {
  if (!syncSystemInitialized) {
    return;
  }

  // Remove event listeners for sync events
  if (Platform.isNative()) {
    BackgroundSync.removeAllListeners().catch(console.error);
  }

  syncSystemInitialized = false;
  console.log('Sync system cleaned up');
};

/**
 * Set up listeners for sync events
 */
const setupSyncEventListeners = () => {
  if (Platform.isNative()) {
    // Listen for sync events from native code
    BackgroundSync.addListener('backgroundSync', async (event) => {
      console.log('Background sync event received:', event);
      
      if (event.type === 'SYNC') {
        try {
          await syncPendingActions();
          console.log('Background sync completed');
        } catch (error) {
          console.error('Background sync failed:', error);
        }
      }
    }).catch(console.error);
  }

  // Also handle web fallback events
  document.addEventListener('backgroundSync', async (event: any) => {
    console.log('Web fallback sync event received:', event.detail?.type);
    
    if (event.detail?.type === 'SYNC') {
      try {
        await syncPendingActions();
        console.log('Web fallback sync completed');
      } catch (error) {
        console.error('Web fallback sync failed:', error);
      }
    }
  });
};

/**
 * Hook to manage sync operations
 */
export const useSyncManager = () => {
  /**
   * Schedule background sync
   */
  const scheduleBackgroundSync = async (force = false) => {
    try {
      if (Platform.isNative()) {
        await BackgroundSync.schedule({ forceImmediate: force });
      } else {
        // For web, we can dispatch a custom event
        if (force) {
          document.dispatchEvent(
            new CustomEvent('backgroundSync', { detail: { type: 'SYNC' } })
          );
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to schedule background sync:', error);
      return false;
    }
  };

  /**
   * Get pending actions count
   */
  const getPendingActionsCount = async (): Promise<number> => {
    try {
      const queue = await getSyncQueue();
      return queue.operations.length;
    } catch (error) {
      console.error('Failed to get pending actions count:', error);
      return 0;
    }
  };

  /**
   * Manual sync function to force immediate sync
   */
  const manualSync = async (): Promise<boolean> => {
    try {
      const success = await syncPendingActions();
      return success;
    } catch (error) {
      console.error('Manual sync failed:', error);
      return false;
    }
  };

  /**
   * Clear all pending actions from the sync queue
   */
  const clearAllPendingActions = async (): Promise<boolean> => {
    try {
      const queue = await getSyncQueue();
      queue.operations = [];
      await saveSyncQueue(queue);
      return true;
    } catch (error) {
      console.error('Failed to clear pending actions:', error);
      return false;
    }
  };

  return {
    scheduleBackgroundSync,
    getPendingActionsCount,
    manualSync,
    clearAllPendingActions,
    getLastSyncTimestamp
  };
};

// Helper function to save sync queue - needed for clearAllPendingActions
const saveSyncQueue = async (queue: any): Promise<void> => {
  try {
    localStorage.setItem('offline_sync_queue', JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving sync queue:', error);
  }
};
