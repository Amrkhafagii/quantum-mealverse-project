
import { DeliveryLocation } from '@/types/location';

// Define tracking modes
export type TrackingMode = 'high' | 'medium' | 'low' | 'minimal';

interface TrackingModeCalculatorOptions {
  isLowBattery: boolean;
  isLowQuality: boolean;
  orderStatus: string;
  location: DeliveryLocation | null;
  customerLocation?: { latitude: number; longitude: number } | null;
  restaurantLocation?: { latitude: number; longitude: number } | null;
  forceLowPowerMode: boolean;
}

interface TrackingModeResult {
  trackingMode: TrackingMode;
  distanceToDestination: number | null;
}

/**
 * Calculate optimal tracking mode based on various factors
 */
export function calculateTrackingMode(options: TrackingModeCalculatorOptions): TrackingModeResult {
  const {
    isLowBattery,
    isLowQuality,
    orderStatus,
    location,
    customerLocation,
    restaurantLocation,
    forceLowPowerMode
  } = options;
  
  // Force low power mode overrides all other factors
  if (forceLowPowerMode) {
    return { trackingMode: 'low', distanceToDestination: null };
  }
  
  // Default to medium tracking
  let trackingMode: TrackingMode = 'medium';
  let distanceToDestination: number | null = null;
  
  // Calculate distance to destination if possible
  if (location && (customerLocation || restaurantLocation)) {
    let targetLocation;
    
    // Determine target location based on order status
    if (orderStatus === 'preparing' || orderStatus === 'ready_for_pickup') {
      targetLocation = restaurantLocation;
    } else {
      targetLocation = customerLocation;
    }
    
    // Calculate distance if target location exists
    if (targetLocation) {
      distanceToDestination = calculateDistance(
        location.latitude,
        location.longitude,
        targetLocation.latitude,
        targetLocation.longitude
      );
    }
  }
  
  // Adjust tracking mode based on order status
  if (orderStatus === 'delivered' || orderStatus === 'cancelled') {
    // Minimal tracking for completed orders
    trackingMode = 'minimal';
  } else if (orderStatus === 'on_the_way') {
    // High tracking when actively delivering
    trackingMode = 'high';
    
    // But still adjust based on distance if available
    if (distanceToDestination !== null) {
      if (distanceToDestination < 0.5) { // Within 500m
        // High frequency updates when close to destination
        trackingMode = 'high';
      } else if (distanceToDestination > 5) { // More than 5km away
        // Medium frequency updates when far from destination
        trackingMode = 'medium';
      }
    }
  }
  
  // Adjust for low battery
  if (isLowBattery) {
    // Step down tracking intensity by one level
    if (trackingMode === 'high') trackingMode = 'medium';
    else if (trackingMode === 'medium') trackingMode = 'low';
    else trackingMode = 'minimal';
  }
  
  // Adjust for poor network quality
  if (isLowQuality) {
    // Reduce tracking frequency when network is poor
    if (trackingMode === 'high') trackingMode = 'medium';
    else if (trackingMode === 'medium') trackingMode = 'low';
  }
  
  return { trackingMode, distanceToDestination };
}

/**
 * Get tracking interval in milliseconds based on tracking mode
 */
export function getTrackingInterval(trackingMode: TrackingMode): number {
  switch (trackingMode) {
    case 'high':
      return 10000; // 10 seconds
    case 'medium':
      return 30000; // 30 seconds
    case 'low':
      return 60000; // 1 minute
    case 'minimal':
      return 300000; // 5 minutes
    default:
      return 30000; // Default to medium
  }
}

/**
 * Calculate distance between two points in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}
