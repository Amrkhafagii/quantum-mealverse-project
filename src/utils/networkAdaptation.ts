
import { NetworkQuality } from '@/types/unifiedLocation';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useMemo } from 'react';

export interface AdaptationStrategy {
  updateInterval: number;
  accuracy: 'high' | 'medium' | 'low';
  compression: boolean;
  retryAttempts: number;
}

export const getAdaptationStrategy = (quality: NetworkQuality): AdaptationStrategy => {
  switch (quality) {
    case 'excellent':
    case 'high':
      return {
        updateInterval: 5000,
        accuracy: 'high',
        compression: false,
        retryAttempts: 3
      };
    case 'good':
    case 'medium':
      return {
        updateInterval: 10000,
        accuracy: 'medium',
        compression: true,
        retryAttempts: 2
      };
    case 'fair':
    case 'low':
      return {
        updateInterval: 20000,
        accuracy: 'low',
        compression: true,
        retryAttempts: 1
      };
    case 'poor':
    case 'very-poor':
    case 'offline':
    default:
      return {
        updateInterval: 60000,
        accuracy: 'low',
        compression: true,
        retryAttempts: 1
      };
  }
};

export const useNetworkAdaptation = () => {
  const { quality } = useNetworkQuality();
  return getAdaptationStrategy(quality);
};

export const getAdaptiveImageDimensions = (
  width: number,
  height: number,
  quality: NetworkQuality
) => {
  let qualityPercent = 1;
  
  switch (quality) {
    case 'excellent':
    case 'high':
      qualityPercent = 1;
      break;
    case 'good':
    case 'medium':
      qualityPercent = 0.8;
      break;
    case 'fair':
    case 'low':
      qualityPercent = 0.6;
      break;
    case 'poor':
    case 'very-poor':
    case 'offline':
    default:
      qualityPercent = 0.4;
      break;
  }
  
  return {
    width: Math.round(width * qualityPercent),
    height: Math.round(height * qualityPercent),
    qualityPercent
  };
};

export const getAdaptivePollingInterval = (
  baseInterval: number,
  quality: NetworkQuality,
  isOnline: boolean,
  batteryLevel?: number
) => {
  if (!isOnline) return baseInterval * 10;
  
  let multiplier = 1;
  
  switch (quality) {
    case 'excellent':
    case 'high':
      multiplier = 1;
      break;
    case 'good':
    case 'medium':
      multiplier = 1.5;
      break;
    case 'fair':
    case 'low':
      multiplier = 2;
      break;
    case 'poor':
    case 'very-poor':
      multiplier = 4;
      break;
    case 'offline':
    default:
      multiplier = 10;
      break;
  }
  
  // Adjust for battery level if available
  if (batteryLevel && batteryLevel < 0.2) {
    multiplier *= 2;
  }
  
  return Math.round(baseInterval * multiplier);
};

export const useRequestBatching = <T>(
  items: T[],
  processItem: (item: T) => Promise<any>
) => {
  const { quality } = useNetworkQuality();
  const { isOnline } = useConnectionStatus();
  
  const batchSize = useMemo(() => {
    if (!isOnline) return 1;
    
    switch (quality) {
      case 'excellent':
      case 'high':
        return 10;
      case 'good':
      case 'medium':
        return 5;
      case 'fair':
      case 'low':
        return 3;
      case 'poor':
      case 'very-poor':
      case 'offline':
      default:
        return 1;
    }
  }, [quality, isOnline]);
  
  const adaptiveInterval = useMemo(() => {
    return getAdaptivePollingInterval(5000, quality, isOnline);
  }, [quality, isOnline]);
  
  const processBatch = async (batch: T[]) => {
    return Promise.all(batch.map(processItem));
  };
  
  return {
    batchSize,
    adaptiveInterval,
    processBatch
  };
};

export const useContentAdaptation = () => {
  const { quality } = useNetworkQuality();
  
  const contentQuality = useMemo(() => {
    switch (quality) {
      case 'excellent':
      case 'high':
        return 'high';
      case 'good':
      case 'medium':
        return 'medium';
      case 'fair':
      case 'low':
      case 'poor':
      case 'very-poor':
      case 'offline':
      default:
        return 'low';
    }
  }, [quality]);
  
  const shouldEnableAnimations = useMemo(() => {
    return quality === 'excellent' || quality === 'high' || quality === 'good';
  }, [quality]);
  
  return {
    contentQuality,
    shouldEnableAnimations
  };
};
