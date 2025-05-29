
/**
 * Calculate the distance between two geographic points using the Haversine formula
 * This implementation works consistently across web, Android, and iOS platforms
 * 
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Add distance calculations to restaurant data
 */
export function addDistanceToRestaurants<T extends { latitude?: number; longitude?: number }>(
  restaurants: T[],
  userLatitude: number,
  userLongitude: number
): (T & { distance_km: number })[] {
  return restaurants.map(restaurant => ({
    ...restaurant,
    distance_km: restaurant.latitude && restaurant.longitude 
      ? calculateDistance(userLatitude, userLongitude, restaurant.latitude, restaurant.longitude)
      : 0
  }));
}
