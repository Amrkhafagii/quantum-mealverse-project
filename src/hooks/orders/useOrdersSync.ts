
import { useState, useEffect } from 'react';
import { useSyncManager } from '@/services/sync/syncManager';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Platform } from '@/utils/platform';

export const useOrdersSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  const { isOnline } = useConnectionStatus();
  const { getPendingActionsCount, manualSync, scheduleBackgroundSync } = useSyncManager();
  
  // Update pending actions count
  useEffect(() => {
    const checkPendingActions = async () => {
      try {
        const count = await getPendingActionsCount();
        setPendingActionsCount(count);
      } catch (error) {
        console.error("Error checking pending actions:", error);
        setPendingActionsCount(0);
      }
    };
    
    checkPendingActions();
    const intervalId = setInterval(() => {
      checkPendingActions();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [getPendingActionsCount]);
  
  // Sync pending actions when coming back online
  useEffect(() => {
    if (isOnline && pendingActionsCount > 0) {
      const performSync = async () => {
        await handleSync();
      };
      
      performSync();
    }
  }, [isOnline, pendingActionsCount]);
  
  // For native platforms, schedule background sync
  useEffect(() => {
    if (Platform.isNative()) {
      try {
        scheduleBackgroundSync(false);
      } catch (error) {
        console.error("Error scheduling background sync:", error);
      }
    } else {
      console.log("Web platform: Background sync scheduling skipped");
    }
  }, [scheduleBackgroundSync]);
  
  const handleSync = async () => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    await manualSync();
    
    // Update pending actions count after sync
    try {
      const count = await getPendingActionsCount();
      setPendingActionsCount(count);
    } catch (error) {
      console.error("Error getting pending actions count:", error);
      setPendingActionsCount(0);
    }
    setTimeout(() => setIsSyncing(false), 1000);
  };
  
  return { pendingActionsCount, handleSync, isSyncing };
};
