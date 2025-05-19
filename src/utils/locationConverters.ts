
import { DeliveryLocation, LocationFreshness } from '@/types/location';

// Convert Capacitor position to our DeliveryLocation format
export function createDeliveryLocation(position: any): DeliveryLocation {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    timestamp: position.timestamp || Date.now(),
    accuracy: position.coords.accuracy,
    speed: position.coords.speed || 0,
    isMoving: (position.coords.speed || 0) > 0.5
  };
}

// Determine location freshness based on timestamp
export function getLocationFreshness(timestamp: number | null): LocationFreshness {
  if (!timestamp) return 'invalid';
  
  const now = Date.now();
  const ageInMinutes = (now - timestamp) / (1000 * 60);
  
  if (ageInMinutes < 1) return 'fresh';
  if (ageInMinutes < 5) return 'moderate';
  if (ageInMinutes < 30) return 'stale';
  return 'invalid';
}

// Calculate distance between two points in kilometers using Haversine formula
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1); 
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c;
  return d;
}

// Convert degrees to radians
function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}
