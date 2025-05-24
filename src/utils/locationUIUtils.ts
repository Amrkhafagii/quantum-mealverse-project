
import { LocationFreshness } from '@/types/location';

export const getLocationFreshnessColor = (freshness: LocationFreshness): string => {
  switch (freshness) {
    case 'fresh':
      return 'text-green-500';
    case 'stale':
      return 'text-yellow-500';
    case 'invalid':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const getLocationFreshnessText = (freshness: LocationFreshness): string => {
  switch (freshness) {
    case 'fresh':
      return 'Location is current';
    case 'stale':
      return 'Location may be outdated';
    case 'invalid':
      return 'Location is too old';
    default:
      return 'Location status unknown';
  }
};

export const formatLocationAccuracy = (accuracy?: number): string => {
  if (!accuracy) return 'Unknown accuracy';
  
  if (accuracy <= 5) return 'Very High';
  if (accuracy <= 10) return 'High';
  if (accuracy <= 50) return 'Medium';
  if (accuracy <= 100) return 'Low';
  return 'Very Low';
};
