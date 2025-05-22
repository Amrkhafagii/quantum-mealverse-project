
import { calculateDistance } from '@/utils/locationUtils';
import { DeliveryLocation } from '@/types/location';

export type TrackingMode = 'high' | 'medium' | 'low' | 'minimal';

interface TrackingModeFactors {
  isLowBattery: boolean;
  isLowQuality: boolean;
  orderStatus?: string;
  location?: DeliveryLocation | null;
  customerLocation?: { latitude: number; longitude: number };
  restaurantLocation?: { latitude: number; longitude: number };
  forceLowPowerMode?: boolean;
}

/**
 * Calculate the optimal tracking mode based on multiple factors
 */
export const calculateTrackingMode = ({
  isLowBattery,
  isLowQuality,
  orderStatus,
  location,
  customerLocation,
  restaurantLocation,
  forceLowPowerMode
}: TrackingModeFactors): {
  trackingMode: TrackingMode;
  distanceToDestination: number | null;
} => {
  // Start with the default mode
  let trackingMode: TrackingMode = 'medium';
  let distanceToDestination: number | null = null;
  
  // Calculate distance to destination if we have necessary data
  if (location) {
    // Determine the relevant destination based on order status
    let destination = null;
    
    if (orderStatus === 'accepted' || orderStatus === 'preparing') {
      // Heading to restaurant
      destination = restaurantLocation;
    } else if (orderStatus === 'picked_up' || orderStatus === 'on_the_way') {
      // Heading to customer
      destination = customerLocation;
    }

    // Calculate distance if we have a destination
    if (destination && destination.latitude && destination.longitude) {
      distanceToDestination = calculateDistance(
        location.latitude, 
        location.longitude,
        destination.latitude,
        destination.longitude
      );
    }
  }

  // Force low power mode if specified
  if (forceLowPowerMode) {
    trackingMode = 'minimal';
  } 
  // Low battery takes precedence for battery conservation
  else if (isLowBattery) {
    trackingMode = 'low';
  } 
  // Network quality affects battery usage and data consumption
  else if (isLowQuality) {
    trackingMode = 'low';
  }
  // Order status and proximity based adjustments
  else if (orderStatus && distanceToDestination !== null) {
    if (orderStatus === 'delivered' || orderStatus === 'cancelled') {
      // Lowest priority - order is complete
      trackingMode = 'minimal';
    }
    else if (orderStatus === 'on_the_way' && distanceToDestination < 1) {
      // Highest priority - very close to customer
      trackingMode = 'high';
    }
    else if ((orderStatus === 'accepted' || orderStatus === 'preparing') && distanceToDestination < 0.5) {
      // High priority - close to restaurant for pickup
      trackingMode = 'high';
    }
    else if (orderStatus === 'on_the_way' && distanceToDestination < 5) {
      // Medium-high priority - approaching customer
      trackingMode = 'medium';
    }
  }
  
  return { trackingMode, distanceToDestination };
};

/**
 * Get the tracking interval in milliseconds based on the tracking mode
 */
export const getTrackingInterval = (trackingMode: TrackingMode): number => {
  switch (trackingMode) {
    case 'high':
      return 10000; // 10 seconds
    case 'medium':
      return 30000; // 30 seconds
    case 'low':
      return 60000; // 1 minute
    case 'minimal':
      return 180000; // 3 minutes
    default:
      return 30000; // Default to medium
  }
};
