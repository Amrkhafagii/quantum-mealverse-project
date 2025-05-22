
import { NetworkQuality, NetworkType } from '@/types/unifiedLocation';
import { Platform } from './platform';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useState, useEffect, useCallback } from 'react';

/**
 * Calculate estimated download time for a file based on network bandwidth
 * @param fileSizeBytes Size of the file in bytes
 * @param bandwidthKbps Bandwidth in Kbps
 * @returns Estimated download time in seconds
 */
export const calculateDownloadTime = (
  fileSizeBytes: number,
  bandwidthKbps: number
): number => {
  if (!bandwidthKbps || bandwidthKbps <= 0) return Infinity;
  
  // Convert file size to kilobits (1 byte = 8 bits)
  const fileSizeKb = (fileSizeBytes * 8) / 1000;
  
  // Calculate time in seconds
  return fileSizeKb / bandwidthKbps;
};

/**
 * Determine if a resource should be preloaded based on network conditions
 * @param resourceSizeBytes Size of the resource in bytes
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Boolean indicating if resource should be preloaded
 */
export const shouldPreloadResource = (
  resourceSizeBytes: number,
  networkType: NetworkType,
  networkQuality: NetworkQuality
): boolean => {
  // Don't preload on poor connections
  if (networkQuality === 'poor' || networkQuality === 'very-poor') {
    return false;
  }
  
  // Always preload small resources
  if (resourceSizeBytes < 50000) { // Less than 50KB
    return true;
  }
  
  // For medium resources, check network type
  if (resourceSizeBytes < 500000) { // Less than 500KB
    return networkType === 'wifi' || 
           networkType === 'ethernet' || 
           networkType === 'cellular_5g' || 
           networkType === 'cellular_4g';
  }
  
  // For large resources, only preload on fast connections
  return (networkType === 'wifi' || networkType === 'ethernet') && 
         (networkQuality === 'excellent' || networkQuality === 'good');
};

/**
 * Get appropriate image quality based on network conditions
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Image quality string ('low', 'medium', 'high', 'original')
 */
export const getAdaptiveImageQuality = (
  networkType: NetworkType,
  networkQuality: NetworkQuality
): 'low' | 'medium' | 'high' | 'original' => {
  // Poor connection - use low quality
  if (networkQuality === 'poor' || networkQuality === 'very-poor') {
    return 'low';
  }
  
  // Cellular connections with fair quality - use medium
  if ((networkType.includes('cellular') && networkType !== 'cellular_5g') && 
      networkQuality === 'fair') {
    return 'medium';
  }
  
  // Good connections - use high quality
  if ((networkType === 'wifi' || networkType === 'ethernet' || networkType === 'cellular_5g') && 
      (networkQuality === 'good' || networkQuality === 'excellent')) {
    return 'original';
  }
  
  // Default to high quality
  return 'high';
};

/**
 * Determine if video should autoplay based on network conditions
 * @param videoSizeBytes Estimated video size in bytes
 * @param durationSeconds Video duration in seconds
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Boolean indicating if video should autoplay
 */
export const shouldAutoplayVideo = (
  videoSizeBytes: number,
  durationSeconds: number,
  networkType: NetworkType,
  networkQuality: NetworkQuality
): boolean => {
  // Never autoplay on poor connections
  if (networkQuality === 'poor' || networkQuality === 'very-poor') {
    return false;
  }
  
  // Calculate bitrate (bytes per second)
  const bitrateBytes = videoSizeBytes / durationSeconds;
  
  // Low bitrate videos can autoplay on most connections
  if (bitrateBytes < 100000) { // Less than ~800Kbps
    return true;
  }
  
  // Medium bitrate videos only on good connections
  if (bitrateBytes < 300000) { // Less than ~2.4Mbps
    return (networkType === 'wifi' || networkType === 'ethernet' || networkType === 'cellular_5g') && 
           (networkQuality === 'good' || networkQuality === 'excellent');
  }
  
  // High bitrate videos only on excellent wifi/ethernet
  return (networkType === 'wifi' || networkType === 'ethernet') && 
         networkQuality === 'excellent';
};

/**
 * Get appropriate video quality based on network conditions
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Video quality string ('240p', '360p', '480p', '720p', '1080p', '4k')
 */
export const getAdaptiveVideoQuality = (
  networkType: NetworkType,
  networkQuality: NetworkQuality
): '240p' | '360p' | '480p' | '720p' | '1080p' | '4k' => {
  // Poor connection - lowest quality
  if (networkQuality === 'poor' || networkQuality === 'very-poor') {
    return '240p';
  }
  
  // Fair connection on cellular - low quality
  if (networkType.includes('cellular') && networkType !== 'cellular_5g' && 
      networkQuality === 'fair') {
    return '360p';
  }
  
  // Good cellular or fair wifi - medium quality
  if ((networkType.includes('cellular') && networkQuality === 'good') || 
      ((networkType === 'wifi' || networkType === 'ethernet') && networkQuality === 'fair')) {
    return '480p';
  }
  
  // Excellent cellular or good wifi - high quality
  if ((networkType.includes('cellular') && networkQuality === 'excellent') || 
      ((networkType === 'wifi' || networkType === 'ethernet') && networkQuality === 'good')) {
    return '720p';
  }
  
  // Excellent wifi/ethernet - highest quality
  if ((networkType === 'wifi' || networkType === 'ethernet') && networkQuality === 'excellent') {
    return '1080p';
  }
  
  // Default to 480p
  return '480p';
};

/**
 * Calculate adaptive fetch timeout based on network conditions
 * @param baseTimeoutMs Base timeout in milliseconds
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Adjusted timeout in milliseconds
 */
export const getAdaptiveFetchTimeout = (
  baseTimeoutMs: number,
  networkType: NetworkType,
  networkQuality: NetworkQuality
): number => {
  let multiplier = 1;
  
  // Adjust based on network quality
  switch (networkQuality) {
    case 'excellent':
      multiplier = 0.8;
      break;
    case 'good':
      multiplier = 1;
      break;
    case 'fair':
      multiplier = 1.5;
      break;
    case 'poor':
      multiplier = 2;
      break;
    case 'very-poor':
      multiplier = 3;
      break;
    default:
      multiplier = 1.5;
  }
  
  // Further adjust based on network type
  if (networkType === 'none') {
    multiplier *= 3;
  } else if (networkType.includes('cellular') && networkType !== 'cellular_5g') {
    multiplier *= 1.5;
  }
  
  return Math.round(baseTimeoutMs * multiplier);
};

/**
 * Determine if a resource should be lazy loaded based on network and device
 * @param resourceSizeBytes Size of the resource in bytes
 * @param network Current network information
 * @returns Boolean indicating if resource should be lazy loaded
 */
export const shouldLazyLoad = (
  resourceSizeBytes: number,
  network: {
    type: NetworkType;
    connected: boolean;
    bandwidth?: number;
  }
): boolean => {
  // Always lazy load large resources
  if (resourceSizeBytes > 1000000) { // > 1MB
    return true;
  }
  
  // Don't lazy load small resources on good connections
  if (resourceSizeBytes < 100000 && // < 100KB
      (network.type === 'wifi' || network.type === 'ethernet') && 
      network.connected) {
    return false;
  }
  
  // Check if we have bandwidth information
  if (network.bandwidth !== undefined) {
    const estimatedDownloadTime = calculateDownloadTime(resourceSizeBytes, network.bandwidth);
    
    // If download would be quick, don't lazy load
    if (estimatedDownloadTime < 0.5) { // Less than 0.5 seconds
      return false;
    }
  }
  
  // Consider device type
  const isMobile = Platform.isMobile();
  const isLowPowerDevice = isMobile && !Platform.isHighEndDevice();
  
  // Lazy load more aggressively on low-power mobile devices
  if (isLowPowerDevice) {
    return resourceSizeBytes > 50000; // > 50KB
  }
  
  // Default behavior - lazy load medium and large resources
  return resourceSizeBytes > 200000; // > 200KB
};

/**
 * Determine if high-end features should be enabled based on device and network
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Boolean indicating if high-end features should be enabled
 */
export const shouldEnableHighEndFeatures = (
  networkType: NetworkType,
  networkQuality: NetworkQuality
): boolean => {
  // Check if device is capable of high-end features
  const isCapableDevice = !Platform.isMobile() || Platform.isHighEndDevice();
  
  if (!isCapableDevice) {
    return false;
  }
  
  // Enable on good wifi/ethernet connections
  if ((networkType === 'wifi' || networkType === 'ethernet') && 
      (networkQuality === 'excellent' || networkQuality === 'good')) {
    return true;
  }
  
  // Enable on excellent 5G
  if (networkType === 'cellular_5g' && networkQuality === 'excellent') {
    return true;
  }
  
  return false;
};

/**
 * Get appropriate batch size for data fetching based on network conditions
 * @param defaultBatchSize Default number of items to fetch
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Adjusted batch size
 */
export const getAdaptiveBatchSize = (
  defaultBatchSize: number,
  networkType: NetworkType,
  networkQuality: NetworkQuality
): number => {
  let multiplier = 1;
  
  // Adjust based on network quality
  switch (networkQuality) {
    case 'excellent':
      multiplier = 1.5;
      break;
    case 'good':
      multiplier = 1.2;
      break;
    case 'fair':
      multiplier = 1;
      break;
    case 'poor':
      multiplier = 0.7;
      break;
    case 'very-poor':
      multiplier = 0.5;
      break;
    default:
      multiplier = 1;
  }
  
  // Further adjust based on network type
  if (networkType === 'none') {
    multiplier = 0.3;
  } else if (networkType === 'wifi' || networkType === 'ethernet') {
    multiplier *= 1.2;
  } else if (networkType.includes('cellular') && networkType !== 'cellular_5g') {
    multiplier *= 0.8;
  }
  
  // Calculate new batch size and ensure it's at least 5
  return Math.max(5, Math.round(defaultBatchSize * multiplier));
};

/**
 * Get adaptive image dimensions based on network conditions and device capabilities
 * @param originalWidth Original image width
 * @param originalHeight Original image height
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Object with adjusted width and height
 */
export const getAdaptiveImageDimensions = (
  originalWidth: number,
  originalHeight: number,
  networkType: NetworkType,
  networkQuality: NetworkQuality
): { width: number; height: number } => {
  let scaleFactor = 1;
  
  // Determine scale factor based on network conditions
  if (networkQuality === 'very-poor') {
    scaleFactor = 0.3; // 30% of original size
  } else if (networkQuality === 'poor') {
    scaleFactor = 0.5; // 50% of original size
  } else if (networkQuality === 'fair') {
    scaleFactor = 0.7; // 70% of original size
  } else if (networkQuality === 'good') {
    scaleFactor = 0.9; // 90% of original size
  }
  
  // Further adjust based on network type
  if (networkType === 'none') {
    scaleFactor *= 0.5;
  } else if (networkType.includes('cellular') && networkType !== 'cellular_5g' && networkType !== 'cellular_4g') {
    scaleFactor *= 0.7;
  }
  
  // Calculate new dimensions
  const width = Math.round(originalWidth * scaleFactor);
  const height = Math.round(originalHeight * scaleFactor);
  
  return { width, height };
};

/**
 * Get adaptive polling interval based on network conditions and app state
 * @param baseIntervalMs Base polling interval in milliseconds
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @param isAppActive Whether the app is in the foreground
 * @returns Adjusted polling interval in milliseconds
 */
export const getAdaptivePollingInterval = (
  baseIntervalMs: number,
  networkType: NetworkType,
  networkQuality: NetworkQuality,
  isAppActive: boolean = true
): number => {
  let multiplier = 1;
  
  // App in background - increase polling interval
  if (!isAppActive) {
    multiplier = 3;
  }
  
  // Adjust based on network quality
  switch (networkQuality) {
    case 'excellent':
      multiplier *= 0.8;
      break;
    case 'good':
      multiplier *= 1;
      break;
    case 'fair':
      multiplier *= 1.5;
      break;
    case 'poor':
      multiplier *= 2.5;
      break;
    case 'very-poor':
      multiplier *= 4;
      break;
  }
  
  // Further adjust based on network type
  if (networkType === 'none') {
    multiplier *= 5;
  } else if (networkType.includes('cellular') && networkType !== 'cellular_5g') {
    multiplier *= 1.5;
  }
  
  // Calculate new interval and apply reasonable limits
  const newInterval = Math.round(baseIntervalMs * multiplier);
  
  // Ensure interval is at least 5 seconds and at most 5 minutes
  return Math.min(Math.max(newInterval, 5000), 300000);
};

/**
 * Custom hook for adapting content based on network and device capabilities
 */
export const useContentAdaptation = () => {
  const { networkQuality } = useNetworkQuality();
  const { networkType, isOnline } = useConnectionStatus();
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    isHighEnd: false,
    isMobile: Platform.isMobile(),
    isNative: Platform.isNative()
  });
  
  // Update device capabilities
  useEffect(() => {
    const checkDeviceCapabilities = async () => {
      const isHighEnd = await Platform.isHighEndDevice();
      
      setDeviceCapabilities({
        isHighEnd,
        isMobile: Platform.isMobile(),
        isNative: Platform.isNative()
      });
    };
    
    checkDeviceCapabilities();
  }, []);
  
  // Calculate content adaptation options
  const adaptiveOptions = {
    imageQuality: getAdaptiveImageQuality(networkType, networkQuality),
    videoQuality: getAdaptiveVideoQuality(networkType, networkQuality),
    enableHighEndFeatures: shouldEnableHighEndFeatures(networkType, networkQuality),
    useLazyLoading: shouldLazyLoad(500000, { type: networkType, connected: isOnline }),
    pollingInterval: getAdaptivePollingInterval(30000, networkType, networkQuality),
    batchSize: getAdaptiveBatchSize(20, networkType, networkQuality),
  };
  
  return {
    ...adaptiveOptions,
    networkQuality,
    networkType,
    isOnline,
    deviceCapabilities
  };
};

/**
 * Custom hook for batched API requests based on network conditions
 */
export const useRequestBatching = (defaultBatchSize: number = 20) => {
  const { networkQuality } = useNetworkQuality();
  const { networkType, isOnline } = useConnectionStatus();
  
  // Calculate optimal batch size
  const batchSize = getAdaptiveBatchSize(defaultBatchSize, networkType, networkQuality);
  
  // Helper function to split large requests into multiple batches
  const batchRequests = useCallback(<T>(
    items: T[],
    processBatch: (batch: T[]) => Promise<any>,
    options?: { 
      onProgress?: (completed: number, total: number) => void,
      sequential?: boolean
    }
  ): Promise<any[]> => {
    const { onProgress, sequential = false } = options || {};
    const batches: T[][] = [];
    
    // Split items into batches
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    // Process batches
    if (sequential) {
      // Process sequentially
      return batches.reduce(async (prevPromise, currentBatch, index) => {
        const results = await prevPromise;
        const batchResults = await processBatch(currentBatch);
        
        if (onProgress) {
          onProgress((index + 1) * batchSize, items.length);
        }
        
        return [...results, batchResults];
      }, Promise.resolve([]) as Promise<any[]>);
    } else {
      // Process in parallel
      const promises = batches.map((batch, index) => {
        const promise = processBatch(batch);
        
        if (onProgress) {
          promise.then(() => {
            onProgress((index + 1) * batchSize, items.length);
          });
        }
        
        return promise;
      });
      
      return Promise.all(promises);
    }
  }, [batchSize]);
  
  return {
    batchSize,
    batchRequests,
    isOnline,
    networkType,
    networkQuality
  };
};
