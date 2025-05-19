
import { registerPlugin } from '@capacitor/core';
import { Platform } from '@/utils/platform';

// Define the interface for our BackgroundSync plugin
export interface BackgroundSyncPlugin {
  schedule(options?: { forceImmediate?: boolean }): Promise<void>;
  getLastSyncTime(): Promise<{ timestamp: number }>;
  addListener(eventName: string, listenerFunc: (data: any) => void): Promise<{ remove: () => void }>;
  removeAllListeners(): Promise<void>;
}

// Web implementation fallback
class BackgroundSyncWeb implements BackgroundSyncPlugin {
  private lastSync: number | null = null;
  
  async schedule(options?: { forceImmediate?: boolean }): Promise<void> {
    console.log('BackgroundSync.schedule called on web - using fallback implementation');
    if (options?.forceImmediate) {
      // If immediate sync requested, trigger the sync event
      document.dispatchEvent(new CustomEvent('backgroundSync', { 
        detail: { type: 'SYNC' } 
      }));
      this.lastSync = Date.now();
    }
    return Promise.resolve();
  }

  async getLastSyncTime(): Promise<{ timestamp: number }> {
    return Promise.resolve({ timestamp: this.lastSync || 0 });
  }

  async addListener(eventName: string, listenerFunc: (data: any) => void): Promise<{ remove: () => void }> {
    console.log('BackgroundSync.addListener called on web - using fallback implementation');
    const handler = (event: Event) => {
      listenerFunc((event as CustomEvent).detail);
    };
    
    document.addEventListener(eventName, handler);
    return Promise.resolve({
      remove: () => {
        document.removeEventListener(eventName, handler);
      }
    });
  }

  async removeAllListeners(): Promise<void> {
    console.log('BackgroundSync.removeAllListeners called on web - using fallback implementation');
    return Promise.resolve();
  }
}

// Register the BackgroundSync plugin with platform-specific implementation
export const BackgroundSync = registerPlugin<BackgroundSyncPlugin>(
  'BackgroundSync',
  {
    web: new BackgroundSyncWeb()
  }
);

// Custom hook for using background sync
export function useBackgroundSync() {
  const scheduleSyncWithForceOption = async (forceImmediate = false): Promise<void> => {
    try {
      if (Platform.isNative()) {
        await BackgroundSync.schedule({ forceImmediate });
        console.log(`Background sync ${forceImmediate ? 'immediately ' : ''}scheduled`);
      } else {
        // Web fallback
        console.log('Web fallback: Background sync not available on web platforms');
        if (forceImmediate) {
          // Directly trigger sync for immediate requests on web
          import('@/services/sync/syncService').then(({ syncPendingActions }) => {
            syncPendingActions().then(() => {
              console.log('Web fallback: Immediate sync completed');
            }).catch(error => {
              console.error('Web fallback: Sync failed:', error);
            });
          });
        }
      }
    } catch (error) {
      console.error('Error scheduling background sync:', error);
    }
  };

  const getLastSyncTimestamp = async (): Promise<number | null> => {
    try {
      if (Platform.isNative()) {
        const result = await BackgroundSync.getLastSyncTime();
        return result.timestamp;
      } else {
        // Web fallback
        return localStorage.getItem('last_sync_timestamp') 
          ? Number(localStorage.getItem('last_sync_timestamp')) 
          : null;
      }
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
          
          // For web fallback, store the timestamp
          if (!Platform.isNative()) {
            localStorage.setItem('last_sync_timestamp', Date.now().toString());
          }
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
