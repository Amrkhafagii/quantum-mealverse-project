import { BackgroundSync } from '@/utils/backgroundSync';
import { Platform } from '@/utils/platform';
import { syncPendingActions } from './syncService';

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
      // This function would check the offline queue for pending operations
      // For now, just return 0 as a placeholder
      return 0;
    } catch (error) {
      console.error('Failed to get pending actions count:', error);
      return 0;
    }
  };

  return {
    scheduleBackgroundSync,
    getPendingActionsCount,
  };
};
