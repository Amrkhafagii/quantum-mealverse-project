
import { registerPlugin } from '@capacitor/core';

// Define the interface for our BackgroundSync plugin
export interface BackgroundSyncPlugin {
  schedule(options?: { forceImmediate?: boolean }): Promise<void>;
  getLastSyncTime(): Promise<{ timestamp: number }>;
  addListener(eventName: string, listenerFunc: (data: any) => void): Promise<{ remove: () => void }>;
  removeAllListeners(): Promise<void>;
}

// Register the BackgroundSync plugin
export const BackgroundSync = registerPlugin<BackgroundSyncPlugin>('BackgroundSync');

// Custom hook for using background sync
export function useBackgroundSync() {
  const scheduleSyncWithForceOption = async (forceImmediate = false): Promise<void> => {
    try {
      await BackgroundSync.schedule({ forceImmediate });
      console.log(`Background sync ${forceImmediate ? 'immediately ' : ''}scheduled`);
    } catch (error) {
      console.error('Error scheduling background sync:', error);
    }
  };

  const getLastSyncTimestamp = async (): Promise<number | null> => {
    try {
      const result = await BackgroundSync.getLastSyncTime();
      return result.timestamp;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  };

  return {
    scheduleSync: () => scheduleSyncWithForceOption(false),
    syncNow: () => scheduleSyncWithForceOption(true),
    getLastSyncTimestamp,
  };
}

// Listen for background sync events from native
export function setupBackgroundSyncListeners(onSyncStarted: () => void, onSyncCompleted: () => void) {
  document.addEventListener('backgroundSyncStarted', () => {
    console.log('Background sync started from native');
    onSyncStarted();
  });

  document.addEventListener('backgroundSync', (event: any) => {
    console.log('Background sync event:', event.detail?.type);
    
    if (event.detail?.type === 'SYNC') {
      // Perform the actual sync operation here
      import('@/services/sync/syncService').then(({ syncPendingActions }) => {
        syncPendingActions().then(() => {
          console.log('Background sync completed');
          onSyncCompleted();
        }).catch(error => {
          console.error('Background sync failed:', error);
        });
      });
    }
  });
}

// Implementation of the actual data synchronization
async function syncPendingActions(): Promise<void> {
  // Use the existing syncPendingActions implementation from src/services/sync/syncService.ts
  try {
    const { syncPendingActions } = await import('@/services/sync/syncService');
    await syncPendingActions();
  } catch (error) {
    console.error('Error during sync:', error);
    throw error;
  }
}
