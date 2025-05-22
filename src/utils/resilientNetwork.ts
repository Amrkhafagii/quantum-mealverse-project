
// Export all resilience-related utilities from a single entry point
export { compress, decompress } from './compressionProvider';
export { compressData, decompressData, shouldCompress, prepareBatchForTransmission } from './dataCompression';
export { retryWithBackoff, calculateBackoffDelay, queueWithRetry } from './retryWithExponentialBackoff';
export type { BackoffOptions } from './retryWithExponentialBackoff';
export { DEFAULT_BACKOFF_OPTIONS } from './retryWithExponentialBackoff';
export { useSyncStrategy, SyncStrategy, SyncMode } from './syncStrategyManager';
export { ConflictStrategy, detectConflict, resolveConflict, prepareForSync } from './conflictResolution';
export type { ConflictMetadata } from './conflictResolution';
