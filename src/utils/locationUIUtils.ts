
import { LocationFreshness } from "@/types/location";

export const getLocationStatusColor = (freshness: LocationFreshness): string => {
  switch (freshness) {
    case 'fresh': return 'bg-green-500/20 border-green-500/30 text-green-400';
    case 'moderate': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
    case 'stale': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
    case 'invalid': return 'bg-red-500/20 border-red-500/30 text-red-400';
    default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
  }
};

export const getLocationStatusMessage = (freshness: LocationFreshness): string => {
  switch (freshness) {
    case 'fresh': return 'Location active';
    case 'moderate': return 'Location good';
    case 'stale': return 'Location needs update';
    case 'invalid': return 'Location outdated';
    default: return 'Unknown status';
  }
};

export const getLocationUpdateRecommendation = (freshness: LocationFreshness): string | null => {
  switch (freshness) {
    case 'moderate': return 'Location update recommended soon';
    case 'stale': return 'Please update your location now';
    case 'invalid': return 'Location is too old, update required';
    default: return null;
  }
};
