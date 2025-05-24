
import { DeliveryLocation, LocationFreshness } from '@/types/location';

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Check if a location is within delivery range
export function isWithinDeliveryRange(
  userLocation: DeliveryLocation,
  restaurantLat: number,
  restaurantLon: number,
  maxDistanceKm: number = 10
): boolean {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    restaurantLat,
    restaurantLon
  );
  return distance <= maxDistanceKm;
}

// Get location freshness based on timestamp
export function getLocationFreshness(timestamp: number): LocationFreshness {
  const now = Date.now();
  const ageInMinutes = (now - timestamp) / (1000 * 60);
  
  if (ageInMinutes <= 5) return 'fresh';
  if (ageInMinutes <= 30) return 'stale';
  return 'invalid';
}

// Format coordinates for display
export function formatCoordinates(lat: number, lon: number): string {
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

// Check if two locations are significantly different
export function hasLocationChanged(
  oldLocation: DeliveryLocation | null,
  newLocation: DeliveryLocation,
  thresholdMeters: number = 10
): boolean {
  if (!oldLocation) return true;
  
  const distance = calculateDistance(
    oldLocation.latitude,
    oldLocation.longitude,
    newLocation.latitude,
    newLocation.longitude
  );
  
  return distance * 1000 > thresholdMeters; // Convert km to meters
}
