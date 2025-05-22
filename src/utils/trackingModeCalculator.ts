
import { DeliveryLocation } from '@/types/location';
import { calculateDistance } from '@/utils/locationUtils';

export type TrackingMode = 'high' | 'medium' | 'low' | 'minimal';

interface TrackingModeParams {
  isLowBattery: boolean;
  isLowQuality: boolean;
  orderStatus: string;
  location: DeliveryLocation | null;
  customerLocation?: { latitude: number; longitude: number };
  restaurantLocation?: { latitude: number; longitude: number };
  forceLowPowerMode?: boolean;
}

export function calculateTrackingMode(params: TrackingModeParams): { 
  trackingMode: TrackingMode; 
  distanceToDestination: number | null;
} {
  const { 
    isLowBattery, 
    isLowQuality, 
    orderStatus, 
    location, 
    customerLocation,
    restaurantLocation,
    forceLowPowerMode
  } = params;
  
  let distanceToDestination: number | null = null;
  
  // Calculate distance to destination based on order status
  if (location) {
    if (orderStatus === 'pickedup' && customerLocation) {
      // If order is picked up, destination is customer
      distanceToDestination = calculateDistance(
        location.latitude,
        location.longitude,
        customerLocation.latitude,
        customerLocation.longitude
      );
    } else if (orderStatus === 'accepted' && restaurantLocation) {
      // If order is accepted but not picked up, destination is restaurant
      distanceToDestination = calculateDistance(
        location.latitude,
        location.longitude,
        restaurantLocation.latitude,
        restaurantLocation.longitude
      );
    }
  }

  // Force low power mode if requested
  if (forceLowPowerMode) {
    return { trackingMode: 'minimal', distanceToDestination };
  }

  // Determine tracking mode based on battery, network, and distance
  if (isLowBattery && isLowQuality) {
    return { trackingMode: 'minimal', distanceToDestination };
  } 
  else if (isLowBattery) {
    return { trackingMode: 'low', distanceToDestination };
  }
  else if (isLowQuality) {
    return { trackingMode: 'low', distanceToDestination };
  }
  else if (distanceToDestination !== null) {
    if (distanceToDestination < 0.5) { // Within 500m
      return { trackingMode: 'high', distanceToDestination };
    }
    else if (distanceToDestination < 2) { // Within 2km
      return { trackingMode: 'medium', distanceToDestination };
    }
  }

  // Default tracking mode based on order status
  if (orderStatus === 'pickedup') {
    return { trackingMode: 'medium', distanceToDestination };
  } else if (orderStatus === 'accepted') {
    return { trackingMode: 'medium', distanceToDestination };
  }

  return { trackingMode: 'low', distanceToDestination };
}

export function getTrackingInterval(mode: TrackingMode): number {
  switch (mode) {
    case 'high':
      return 10000; // 10 seconds
    case 'medium':
      return 30000; // 30 seconds
    case 'low':
      return 60000; // 1 minute
    case 'minimal':
      return 120000; // 2 minutes
    default:
      return 30000; // Default to medium
  }
}
