
import React, { useEffect, useState } from 'react';
import { Platform } from '@/utils/platform';
import { initializeSyncSystem, cleanupSyncSystem, useSyncManager } from '@/services/sync/syncManager';

interface BackgroundSyncManagerProps {
  children?: React.ReactNode;
}

export function BackgroundSyncManager({ children }: BackgroundSyncManagerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { getPendingActionsCount, scheduleBackgroundSync } = useSyncManager();
  const [pendingCount, setPendingCount] = useState(0);

  // Initialize the sync system
  useEffect(() => {
    initializeSyncSystem();
    setIsInitialized(true);

    // Setup periodic checks for pending actions
    const intervalId = setInterval(async () => {
      const count = await getPendingActionsCount();
      setPendingCount(count);
    }, 30000); // Check every 30 seconds

    // If on native platform, schedule background sync
    if (Platform.isNative()) {
      scheduleBackgroundSync(false);
    } else {
      // For web, we can still set up periodic checks
      console.log('Web platform detected: Using web fallback for background sync');
    }

    return () => {
      clearInterval(intervalId);
      cleanupSyncSystem();
    };
  }, []);

  // Check pending actions count on mount and when initialized
  useEffect(() => {
    if (isInitialized) {
      getPendingActionsCount().then(setPendingCount);
    }
  }, [isInitialized]);

  return children ? <>{children}</> : null;
}
