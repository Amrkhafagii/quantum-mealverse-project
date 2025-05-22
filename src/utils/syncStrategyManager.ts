
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { BackoffOptions } from './retryWithExponentialBackoff';

/**
 * Types of sync strategies
 */
export enum SyncStrategy {
  EAGER = 'eager',       // Send updates immediately
  BATCH = 'batch',       // Batch updates to reduce network overhead
  DIFFERENTIAL = 'diff', // Send only changed fields
  COMPRESSED = 'compressed', // Use compression for updates
  PRIORITY = 'priority'  // Prioritize certain updates over others
}

/**
 * Sync mode based on connection quality
 */
export enum SyncMode {
  REALTIME = 'realtime',   // Immediate sync (good connection)
  THROTTLED = 'throttled', // Periodic sync (moderate connection)
  MINIMAL = 'minimal',     // Essential updates only (poor connection)
  OFFLINE = 'offline'      // Store locally, sync later (no connection)
}

interface SyncConfig {
  mode: SyncMode;
  strategies: SyncStrategy[];
  syncInterval: number;
  maxBatchSize: number;
  compressionThreshold: number;
  retryConfig: BackoffOptions;
}

/**
 * Hook to get adaptive sync configuration based on network conditions
 */
export const useSyncStrategy = () => {
  const { isOnline, connectionType } = useConnectionStatus();
  const { quality, isLowQuality } = useNetworkQuality();
  
  // Determine optimal sync mode based on network conditions
  const determineSyncMode = (): SyncMode => {
    if (!isOnline) return SyncMode.OFFLINE;
    
    if (connectionType === 'wifi' && quality !== 'poor') {
      return SyncMode.REALTIME;
    } else if (isLowQuality || quality === 'poor') {
      return SyncMode.MINIMAL;
    } else {
      return SyncMode.THROTTLED;
    }
  };
  
  // Get appropriate strategies for current network conditions
  const determineStrategies = (mode: SyncMode): SyncStrategy[] => {
    switch (mode) {
      case SyncMode.REALTIME:
        return [SyncStrategy.EAGER];
      
      case SyncMode.THROTTLED:
        return [SyncStrategy.BATCH, SyncStrategy.PRIORITY];
      
      case SyncMode.MINIMAL:
        return [SyncStrategy.BATCH, SyncStrategy.DIFFERENTIAL, SyncStrategy.COMPRESSED];
      
      case SyncMode.OFFLINE:
      default:
        return [SyncStrategy.BATCH, SyncStrategy.COMPRESSED];
    }
  };
  
  // Determine sync interval based on mode
  const determineSyncInterval = (mode: SyncMode): number => {
    switch (mode) {
      case SyncMode.REALTIME:
        return 0; // Immediate
      case SyncMode.THROTTLED:
        return 30000; // 30 seconds
      case SyncMode.MINIMAL:
        return 120000; // 2 minutes
      case SyncMode.OFFLINE:
        return 300000; // 5 minutes (for when reconnected)
    }
  };
  
  // Configure retry strategy based on connection quality
  const configureRetryStrategy = (mode: SyncMode): BackoffOptions => {
    switch (mode) {
      case SyncMode.REALTIME:
        return {
          initialDelayMs: 500,
          maxDelayMs: 10000,
          maxRetries: 3,
          backoffFactor: 2
        };
      case SyncMode.THROTTLED:
        return {
          initialDelayMs: 2000,
          maxDelayMs: 30000,
          maxRetries: 5,
          backoffFactor: 1.5
        };
      case SyncMode.MINIMAL:
      case SyncMode.OFFLINE:
      default:
        return {
          initialDelayMs: 5000,
          maxDelayMs: 300000, // 5 minutes
          maxRetries: 10,
          backoffFactor: 2
        };
    }
  };
  
  // Get the current sync configuration
  const getSyncConfig = (): SyncConfig => {
    const mode = determineSyncMode();
    return {
      mode,
      strategies: determineStrategies(mode),
      syncInterval: determineSyncInterval(mode),
      maxBatchSize: mode === SyncMode.MINIMAL ? 5 : 20,
      compressionThreshold: 1024, // 1KB
      retryConfig: configureRetryStrategy(mode)
    };
  };
  
  // Determine if a strategy is active
  const isStrategyActive = (strategy: SyncStrategy): boolean => {
    return getSyncConfig().strategies.includes(strategy);
  };
  
  return {
    syncConfig: getSyncConfig(),
    syncMode: determineSyncMode(),
    isStrategyActive,
    isOnline
  };
};
