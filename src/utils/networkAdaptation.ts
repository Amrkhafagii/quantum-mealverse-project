
import { NetworkQuality } from '@/types/unifiedLocation';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';

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
