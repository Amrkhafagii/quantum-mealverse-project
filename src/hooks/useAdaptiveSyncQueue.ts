
import { useState, useCallback, useMemo } from 'react';
import { useRequestQueue } from '@/components/network/RequestQueue';
import { useSyncStrategy, SyncStrategy } from '@/utils/syncStrategyManager';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { compressData, shouldCompress } from '@/utils/dataCompression';
import { ConflictStrategy } from '@/utils/conflictResolution';

/**
 * Options for synchronization request
 */
interface SyncRequestOptions {
  priority?: 'high' | 'normal' | 'low';
  maxRetries?: number;
  compressionEnabled?: boolean;
  conflictResolutionStrategy?: ConflictStrategy;
  description?: string;
}

/**
 * Hook for adaptive data synchronization with resilience features
 */
export function useAdaptiveSyncQueue() {
  const { queueRequest } = useRequestQueue();
  const { syncConfig, isStrategyActive } = useSyncStrategy();
  const { isOnline } = useConnectionStatus();
  const [batched, setBatched] = useState<Record<string, any[]>>({});
  
  /**
   * Queue a sync operation with resilience features
   */
  const queueSync = useCallback(<T>(
    apiCall: (data: T) => Promise<any>,
    data: T,
    options: SyncRequestOptions = {}
  ): string => {
    // Apply defaults from sync config
    const shouldUseCompression = isStrategyActive(SyncStrategy.COMPRESSED) &&
      (options.compressionEnabled ?? true);
      
    const maxRetries = options.maxRetries ?? syncConfig.retryConfig.maxRetries;
    const priority = options.priority ?? 'normal';
    
    const requestDescription = options.description ?? 'Sync operation';
    
    // Queue the sync operation
    return queueRequest({
      execute: async () => {
        // Automatically apply compression if needed
        if (shouldUseCompression && shouldCompress(data)) {
          const compressed = await compressData(data);
          return apiCall(compressed as unknown as T);
        }
        return apiCall(data);
      },
      priority,
      maxRetries,
      description: requestDescription,
      data,
      compressionEnabled: shouldUseCompression,
      conflictResolutionStrategy: options.conflictResolutionStrategy || ConflictStrategy.TIMESTAMP_WINS,
    });
  }, [queueRequest, isStrategyActive, syncConfig.retryConfig.maxRetries]);
  
  /**
   * Add an item to a batch for later processing
   */
  const addToBatch = useCallback((batchKey: string, item: any): void => {
    setBatched(prev => {
      const batch = prev[batchKey] || [];
      return {
        ...prev,
        [batchKey]: [...batch, item]
      };
    });
  }, []);
  
  /**
   * Process a batch immediately
   */
  const processBatch = useCallback((
    batchKey: string,
    batchProcessor: (items: any[]) => Promise<any>,
    options: SyncRequestOptions = {}
  ): string | null => {
    const batch = batched[batchKey];
    if (!batch || batch.length === 0) return null;
    
    // Clear this batch
    setBatched(prev => ({
      ...prev,
      [batchKey]: []
    }));
    
    // Queue the batch processing
    return queueSync(batchProcessor, batch, {
      ...options,
      description: options.description || `Process batch: ${batchKey}`
    });
  }, [batched, queueSync]);
  
  /**
   * Get the status of the current network and sync configuration
   */
  const syncStatus = useMemo(() => ({
    mode: syncConfig.mode,
    isOnline,
    activeStrategies: syncConfig.strategies,
    batchSize: syncConfig.maxBatchSize
  }), [syncConfig, isOnline]);
  
  return {
    queueSync,
    addToBatch,
    processBatch,
    batched,
    syncStatus
  };
}

export default useAdaptiveSyncQueue;
