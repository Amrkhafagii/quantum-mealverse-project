
import { useNetworkQuality, NetworkQuality } from '@/hooks/useNetworkQuality';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

// Quality tiers for content
export type ContentQualityLevel = 'high' | 'medium' | 'low' | 'minimal';

/**
 * Map network quality to content quality levels
 * @param networkQuality Current network quality
 * @returns Appropriate content quality level
 */
export const mapNetworkToContentQuality = (networkQuality: NetworkQuality): ContentQualityLevel => {
  switch (networkQuality) {
    case 'excellent':
    case 'good':
      return 'high';
    case 'fair':
      return 'medium';
    case 'poor':
      return 'low';
    case 'very-poor':
    case 'unknown':
      return 'minimal';
    default:
      return 'medium';
  }
};

/**
 * Calculate appropriate polling interval based on network quality
 * @param baseInterval Base polling interval in ms
 * @param networkQuality Current network quality
 * @returns Adjusted polling interval in ms
 */
export const getAdaptivePollingInterval = (
  baseInterval: number,
  networkQuality: NetworkQuality,
  isOnline: boolean
): number => {
  if (!isOnline) return 0; // Don't poll when offline
  
  const multipliers: Record<NetworkQuality, number> = {
    'excellent': 1,
    'good': 1.5,
    'fair': 2,
    'poor': 3,
    'very-poor': 5,
    'unknown': 2.5
  };
  
  return Math.round(baseInterval * (multipliers[networkQuality] || 2));
};

/**
 * Get optimal image dimensions based on network quality
 * @param originalWidth Original image width
 * @param originalHeight Original image height
 * @param networkQuality Current network quality
 * @returns Optimized dimensions
 */
export const getAdaptiveImageDimensions = (
  originalWidth: number,
  originalHeight: number,
  networkQuality: NetworkQuality
): { width: number; height: number } => {
  // Scale factors based on network quality
  const scaleFactor: Record<NetworkQuality, number> = {
    'excellent': 1,    // Full resolution
    'good': 0.8,       // 80% of original size
    'fair': 0.6,       // 60% of original size
    'poor': 0.4,       // 40% of original size
    'very-poor': 0.25, // 25% of original size
    'unknown': 0.6     // Default to medium quality
  };
  
  const factor = scaleFactor[networkQuality] || 0.6;
  
  return {
    width: Math.round(originalWidth * factor),
    height: Math.round(originalHeight * factor)
  };
};

/**
 * Hook for content adaptation based on network quality
 */
export function useContentAdaptation() {
  const { quality, isLowQuality, bandwidth } = useNetworkQuality();
  const { isOnline } = useConnectionStatus();
  
  const contentQuality = isOnline 
    ? mapNetworkToContentQuality(quality)
    : 'minimal';
  
  const getImageQuality = (originalUrl: string): string => {
    if (!isOnline) {
      // Return a data URI for placeholder or use cached version
      return originalUrl;
    }
    
    if (contentQuality === 'high') {
      return originalUrl;
    }
    
    // Example of how you might transform image URLs for different qualities
    // You would need to implement a real image resizing service
    if (originalUrl.includes('?')) {
      return `${originalUrl}&quality=${contentQuality}`;
    } else {
      return `${originalUrl}?quality=${contentQuality}`;
    }
  };
  
  // Generate adaptive polling intervals
  const getPollingInterval = (baseInterval: number): number => {
    return getAdaptivePollingInterval(baseInterval, quality, isOnline);
  };
  
  // Determine if animations should be enabled
  const shouldEnableAnimations = isOnline && (quality === 'excellent' || quality === 'good');
  
  // Determine if high-quality assets should be loaded
  const shouldLoadHighQualityAssets = isOnline && !isLowQuality;
  
  // Calculate batch size for network requests based on connection
  const getBatchSize = (): number => {
    if (!isOnline) return 1;
    
    switch (quality) {
      case 'excellent': return 10;
      case 'good': return 5;
      case 'fair': return 3;
      case 'poor': return 2;
      case 'very-poor': return 1;
      default: return 3;
    }
  };
  
  return {
    contentQuality,
    getImageQuality,
    getPollingInterval,
    shouldEnableAnimations,
    shouldLoadHighQualityAssets,
    getBatchSize,
    isLowQuality,
    isOnline
  };
}

/**
 * Hook for managing batched requests based on network quality
 */
export function useRequestBatching<T>(items: T[], processItem: (item: T) => Promise<any>) {
  const { getBatchSize, getPollingInterval } = useContentAdaptation();
  const { isOnline } = useConnectionStatus();
  
  const processBatch = async (batch: T[]): Promise<void> => {
    if (!isOnline || batch.length === 0) return;
    
    // Process items in parallel with a limited concurrency based on network quality
    const batchSize = getBatchSize();
    const results = [];
    
    // Process in chunks
    for (let i = 0; i < batch.length; i += batchSize) {
      const chunk = batch.slice(i, i + batchSize);
      const chunkPromises = chunk.map(processItem);
      results.push(...await Promise.all(chunkPromises));
    }
    
    return;
  };
  
  return {
    processBatch,
    batchSize: getBatchSize(),
    adaptiveInterval: getPollingInterval(5000) // 5 seconds as base interval
  };
}
