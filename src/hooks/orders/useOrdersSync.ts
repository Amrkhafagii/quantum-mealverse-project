
import { useState, useEffect } from 'react';
import { syncPendingActions, getPendingActions } from '@/utils/offlineStorage';

export const useOrdersSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  const { isOnline } = useConnectionStatus();
  
  // Update pending actions count
  useEffect(() => {
    const checkPendingActions = async () => {
      try {
        const pendingActions = await getPendingActions();
        setPendingActionsCount(pendingActions.length);
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
  }, []);
  
  // Sync pending actions when coming back online
  useEffect(() => {
    if (isOnline) {
      const performSync = async () => {
        await syncPendingActions();
        // Update pending actions count after sync
        try {
          const pendingActions = await getPendingActions();
          setPendingActionsCount(pendingActions.length);
        } catch (error) {
          console.error("Error getting pending actions:", error);
          setPendingActionsCount(0);
        }
      };
      
      performSync();
    }
  }, [isOnline]);
  
  const handleSync = async () => {
    setIsSyncing(true);
    await syncPendingActions();
    // Update pending actions count after sync
    try {
      const pendingActions = await getPendingActions();
      setPendingActionsCount(pendingActions.length);
    } catch (error) {
      console.error("Error getting pending actions count:", error);
      setPendingActionsCount(0);
    }
    setTimeout(() => setIsSyncing(false), 1000);
  };
  
  return { pendingActionsCount, handleSync, isSyncing };
};

// Make sure to include this import at the top
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
