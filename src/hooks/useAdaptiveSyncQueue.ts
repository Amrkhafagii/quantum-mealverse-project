
import { useRequestQueue } from '@/contexts/RequestQueueContext';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useEffect } from 'react';

export const useAdaptiveSyncQueue = () => {
  const { queueRequest, processQueue, queuedRequests } = useRequestQueue();
  const { isOnline } = useConnectionStatus();

  useEffect(() => {
    if (isOnline && queuedRequests.length > 0) {
      processQueue();
    }
  }, [isOnline, queuedRequests.length, processQueue]);

  const syncRequest = async (url: string, options: RequestInit) => {
    if (isOnline) {
      // Process immediately if online
      try {
        return await fetch(url, options);
      } catch (error) {
        // Queue if request fails
        queueRequest({
          url,
          method: options.method || 'GET',
          body: options.body,
        });
        throw error;
      }
    } else {
      // Queue for later if offline
      queueRequest({
        url,
        method: options.method || 'GET',
        body: options.body,
      });
      return null;
    }
  };

  return {
    syncRequest,
    queuedCount: queuedRequests.length,
  };
};
