
import React, { useEffect, useState } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { syncPendingActions } from '@/utils/offlineStorage';

interface ConnectionRecoveryManagerProps {
  children: React.ReactNode;
}

export const ConnectionRecoveryManager: React.FC<ConnectionRecoveryManagerProps> = ({
  children
}) => {
  const { isOnline, wasOffline } = useConnectionStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleConnectionRecovery = async () => {
      if (isOnline && wasOffline && !isSyncing) {
        console.log('Connection recovered, syncing pending actions...');
        setIsSyncing(true);
        
        try {
          await syncPendingActions();
          console.log('Successfully synced pending actions');
        } catch (error) {
          console.error('Failed to sync pending actions:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    handleConnectionRecovery();
  }, [isOnline, wasOffline, isSyncing]);

  return <>{children}</>;
};
