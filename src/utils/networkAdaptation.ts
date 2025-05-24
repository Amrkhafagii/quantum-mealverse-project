import { useState, useEffect, useCallback } from 'react';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { NetworkQuality } from '@/types/unifiedLocation';

export type ContentQuality = 'high' | 'medium' | 'low' | 'minimal';

// Hook for requesting content adaptation based on network quality
export function useContentAdaptation() {
  const { quality, isLowQuality } = useNetworkQuality();
  const { isOnline } = useConnectionStatus();
  const [contentQuality, setContentQuality] = useState<ContentQuality>('high');
  const [shouldEnableAnimations, setShouldEnableAnimations] = useState(true);
  
  useEffect(() => {
    // Determine content quality based on network status
    if (!isOnline) {
      setContentQuality('minimal');
      setShouldEnableAnimations(false);
    } else if (quality === 'poor' || quality === 'very-poor') {
      setContentQuality('low');
      setShouldEnableAnimations(false);
    } else if (quality === 'fair' || quality === 'moderate') {
      setContentQuality('medium');
      setShouldEnableAnimations(true);
    } else {
      setContentQuality('high');
      setShouldEnableAnimations(true);
    }
  }, [quality, isOnline]);
  
  return {
    contentQuality,
    shouldEnableAnimations
  };
}

// Hook for batching API requests based on network conditions
export function useRequestBatching<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  options = { maxBatchSize: 10 }
) {
  const { quality, isLowQuality } = useNetworkQuality();
  const { isOnline } = useConnectionStatus();
  const [batchSize, setBatchSize] = useState(options.maxBatchSize);
  const [adaptiveInterval, setAdaptiveInterval] = useState(5000);
  
  // Adjust batch size based on network quality
  useEffect(() => {
    if (!isOnline) {
      setBatchSize(1);
      setAdaptiveInterval(60000); // 1 minute when offline (will queue)
    } else if (quality === 'very-poor' || quality === 'poor') {
      setBatchSize(Math.max(1, Math.floor(options.maxBatchSize / 5)));
      setAdaptiveInterval(15000); // 15 seconds for poor connection
    } else if (quality === 'fair' || quality === 'moderate') {
      setBatchSize(Math.max(2, Math.floor(options.maxBatchSize / 2)));
      setAdaptiveInterval(10000); // 10 seconds for fair connection
    } else {
      setBatchSize(options.maxBatchSize);
      setAdaptiveInterval(5000); // 5 seconds for good connection
    }
  }, [quality, isOnline, options.maxBatchSize]);
  
  // Process batch of items
  const processBatch = useCallback(async (): Promise<R[]> => {
    if (!isOnline) {
      return [];
    }
    
    try {
      const results: R[] = [];
      // Process in batches
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(processFn));
        results.push(...batchResults);
      }
      return results;
    } catch (error) {
      console.error('Error processing batch:', error);
      return [];
    }
  }, [items, processFn, batchSize, isOnline]);
  
  return {
    processBatch,
    batchSize,
    adaptiveInterval
  };
}

// Function to calculate adaptive image dimensions based on network quality
export function getAdaptiveImageDimensions(
  originalWidth: number,
  originalHeight: number,
  networkQuality: NetworkQuality,
  defaultQuality = 'high'
): { width: number; height: number; qualityPercent: number } {
  // Default to high quality
  let scale = 1.0;
  let qualityPercent = 90;
  
  switch (networkQuality) {
    case 'very-poor':
      scale = 0.3;
      qualityPercent = 30;
      break;
    case 'poor':
      scale = 0.5;
      qualityPercent = 50;
      break;
    case 'moderate':
    case 'fair':
      scale = 0.7;
      qualityPercent = 70;
      break;
    case 'good':
      scale = 0.9;
      qualityPercent = 85;
      break;
    case 'excellent':
    default:
      scale = 1.0;
      qualityPercent = 90;
  }
  
  // Calculate dimensions
  const width = Math.round(originalWidth * scale);
  const height = Math.round(originalHeight * scale);
  
  return { width, height, qualityPercent };
}

// Function to determine adaptive polling interval based on network quality
export function getAdaptivePollingInterval(
  baseInterval: number,
  networkQuality: NetworkQuality,
  isOnline: boolean,
  batteryLevel?: number
): number {
  if (!isOnline) {
    return baseInterval * 5; // Much longer when offline
  }
  
  // Adjust interval based on network quality
  let intervalMultiplier = 1;
  
  switch (networkQuality) {
    case 'very-poor':
      intervalMultiplier = 4;
      break;
    case 'poor':
      intervalMultiplier = 3;
      break;
    case 'moderate':
    case 'fair':
      intervalMultiplier = 2;
      break;
    case 'good':
      intervalMultiplier = 1.25;
      break;
    case 'excellent':
    default:
      intervalMultiplier = 1;
  }
  
  // Further increase interval if battery is low
  if (batteryLevel !== undefined && batteryLevel < 20) {
    intervalMultiplier *= 1.5;
  }
  
  return Math.round(baseInterval * intervalMultiplier);
}

export interface AdaptationSettings {
  pollingInterval: number;
  requestTimeout: number;
  retryAttempts: number;
  enableOptimizations: boolean;
}

export const getAdaptationSettings = (quality: NetworkQuality): AdaptationSettings => {
  switch (quality) {
    case 'high':
    case 'excellent':
      return {
        pollingInterval: 5000,
        requestTimeout: 10000,
        retryAttempts: 3,
        enableOptimizations: false
      };
    case 'medium':
    case 'good':
    case 'fair':
      return {
        pollingInterval: 10000,
        requestTimeout: 15000,
        retryAttempts: 2,
        enableOptimizations: true
      };
    case 'low':
    case 'poor':
    case 'very-poor':
      return {
        pollingInterval: 30000,
        requestTimeout: 30000,
        retryAttempts: 1,
        enableOptimizations: true
      };
    case 'offline':
      return {
        pollingInterval: 60000,
        requestTimeout: 60000,
        retryAttempts: 0,
        enableOptimizations: true
      };
    default:
      return {
        pollingInterval: 15000,
        requestTimeout: 20000,
        retryAttempts: 2,
        enableOptimizations: true
      };
  }
};

export const shouldReduceAnimations = (quality: NetworkQuality): boolean => {
  return quality === 'low' || quality === 'poor' || quality === 'very-poor' || quality === 'offline';
};

export const getImageQuality = (quality: NetworkQuality): 'low' | 'medium' | 'high' => {
  switch (quality) {
    case 'high':
    case 'excellent':
      return 'high';
    case 'medium':
    case 'good':
    case 'fair':
      return 'medium';
    case 'low':
    case 'poor':
    case 'very-poor':
    case 'offline':
    default:
      return 'low';
  }
};

export const getOptimalBatchSize = (quality: NetworkQuality): number => {
  switch (quality) {
    case 'high':
    case 'excellent':
      return 50;
    case 'medium':
    case 'good':
    case 'fair':
      return 25;
    case 'low':
    case 'poor':
    case 'very-poor':
      return 10;
    case 'offline':
    default:
      return 5;
  }
};
