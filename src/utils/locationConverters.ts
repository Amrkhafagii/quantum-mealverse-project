
import { DeliveryLocation, LocationFreshness } from '@/types/location';
import { UnifiedLocation } from '@/types/unifiedLocation';

export const convertToDeliveryLocation = (unifiedLocation: UnifiedLocation): DeliveryLocation => {
  return {
    latitude: unifiedLocation.latitude,
    longitude: unifiedLocation.longitude,
    accuracy: unifiedLocation.accuracy,
    altitude: unifiedLocation.altitude,
    altitudeAccuracy: unifiedLocation.altitudeAccuracy,
    heading: unifiedLocation.heading,
    speed: unifiedLocation.speed,
    timestamp: unifiedLocation.timestamp,
    source: unifiedLocation.source as any,
    isMoving: unifiedLocation.isMoving
  };
};

export const convertToUnifiedLocation = (deliveryLocation: DeliveryLocation): Partial<UnifiedLocation> => {
  return {
    latitude: deliveryLocation.latitude,
    longitude: deliveryLocation.longitude,
    accuracy: deliveryLocation.accuracy,
    altitude: deliveryLocation.altitude,
    altitudeAccuracy: deliveryLocation.altitudeAccuracy,
    heading: deliveryLocation.heading,
    speed: deliveryLocation.speed,
    timestamp: deliveryLocation.timestamp,
    source: deliveryLocation.source as any,
    isMoving: deliveryLocation.isMoving
  };
};

export const getFreshnessLevel = (timestamp: number): LocationFreshness => {
  const now = Date.now();
  const ageInMinutes = (now - timestamp) / (1000 * 60);
  
  if (ageInMinutes <= 5) return 'fresh';
  if (ageInMinutes <= 30) return 'stale';
  return 'expired';
};
