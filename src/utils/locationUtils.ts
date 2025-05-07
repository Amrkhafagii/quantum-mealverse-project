
import { DeliveryLocation } from '@/types/location';

/**
 * Save delivery location to local storage
 */
export const cacheDeliveryLocation = (location: DeliveryLocation): void => {
  try {
    localStorage.setItem('deliveryLocation', JSON.stringify(location));
  } catch (error) {
    console.error('Error caching delivery location:', error);
  }
};

/**
 * Get cached delivery location from local storage
 */
export const getCachedDeliveryLocation = (): DeliveryLocation | null => {
  try {
    const cached = localStorage.getItem('deliveryLocation');
    if (!cached) return null;
    
    return JSON.parse(cached) as DeliveryLocation;
  } catch (error) {
    console.error('Error getting cached delivery location:', error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

/**
 * Convert degrees to radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

/**
 * Format a location for display
 */
export const formatLocationForDisplay = (location: DeliveryLocation): string => {
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
};

/**
 * Check if a location is valid
 */
export const isValidLocation = (location: any): boolean => {
  return (
    location &&
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    !isNaN(location.latitude) &&
    !isNaN(location.longitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
};

/**
 * Calculate the bearing between two coordinates
 */
export const calculateBearing = (
  startLat: number, 
  startLng: number, 
  destLat: number, 
  destLng: number
): number => {
  startLat = deg2rad(startLat);
  startLng = deg2rad(startLng);
  destLat = deg2rad(destLat);
  destLng = deg2rad(destLng);

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x = Math.cos(startLat) * Math.sin(destLat) -
            Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let bearing = Math.atan2(y, x);
  bearing = bearing * (180 / Math.PI);
  bearing = (bearing + 360) % 360;
  
  return bearing;
};

/**
 * Determine if a location is stale based on timestamp
 * Returns true if the location is older than 5 minutes
 */
export const isLocationStale = (timestamp: number): boolean => {
  const now = Date.now();
  const ageInMinutes = (now - timestamp) / (1000 * 60);
  return ageInMinutes > 5; // Location is stale if older than 5 minutes
};

/**
 * Calculate location freshness level
 * - fresh: less than 2 minutes old
 * - moderate: 2-5 minutes old
 * - stale: 5-30 minutes old
 * - invalid: older than 30 minutes
 */
export const calculateLocationFreshness = (timestamp: number): 'fresh' | 'moderate' | 'stale' | 'invalid' => {
  const now = Date.now();
  const ageInMinutes = (now - timestamp) / (1000 * 60);
  
  if (ageInMinutes < 2) {
    return 'fresh';
  } else if (ageInMinutes < 5) {
    return 'moderate';
  } else if (ageInMinutes < 30) {
    return 'stale';
  } else {
    return 'invalid';
  }
};

/**
 * Cache an order for offline access
 */
export const cacheOrderData = (orderId: string, orderData: any): void => {
  try {
    const cachedOrders = getCachedOrders();
    cachedOrders[orderId] = {
      data: orderData,
      timestamp: Date.now()
    };
    localStorage.setItem('cached_orders', JSON.stringify(cachedOrders));
  } catch (error) {
    console.error('Error caching order data:', error);
  }
};

/**
 * Get a cached order by ID
 */
export const getCachedOrder = (orderId: string): any | null => {
  try {
    const cachedOrders = getCachedOrders();
    return cachedOrders[orderId]?.data || null;
  } catch (error) {
    console.error('Error getting cached order:', error);
    return null;
  }
};

/**
 * Get all cached orders
 */
export const getCachedOrders = (): Record<string, { data: any, timestamp: number }> => {
  try {
    const cached = localStorage.getItem('cached_orders');
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error('Error getting cached orders:', error);
    return {};
  }
};

/**
 * Clear a cached order by ID
 */
export const clearCachedOrder = (orderId: string): void => {
  try {
    const cachedOrders = getCachedOrders();
    if (cachedOrders[orderId]) {
      delete cachedOrders[orderId];
      localStorage.setItem('cached_orders', JSON.stringify(cachedOrders));
    }
  } catch (error) {
    console.error('Error clearing cached order:', error);
  }
};

/**
 * Clear all cached orders
 */
export const clearAllCachedOrders = (): void => {
  try {
    localStorage.removeItem('cached_orders');
  } catch (error) {
    console.error('Error clearing all cached orders:', error);
  }
};

/**
 * Store pending actions to be performed when online
 */
export const storePendingAction = (action: { type: string, payload: any }): void => {
  try {
    const pendingActions = getPendingActions();
    pendingActions.push({
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    });
    localStorage.setItem('pending_actions', JSON.stringify(pendingActions));
  } catch (error) {
    console.error('Error storing pending action:', error);
  }
};

/**
 * Get all pending actions
 */
export const getPendingActions = (): Array<{ type: string, payload: any, id: string, timestamp: number }> => {
  try {
    const cached = localStorage.getItem('pending_actions');
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
};

/**
 * Remove a pending action by ID
 */
export const removePendingAction = (actionId: string): void => {
  try {
    const pendingActions = getPendingActions();
    const updatedActions = pendingActions.filter(action => action.id !== actionId);
    localStorage.setItem('pending_actions', JSON.stringify(updatedActions));
  } catch (error) {
    console.error('Error removing pending action:', error);
  }
};

/**
 * Clear all pending actions
 */
export const clearAllPendingActions = (): void => {
  try {
    localStorage.removeItem('pending_actions');
  } catch (error) {
    console.error('Error clearing all pending actions:', error);
  }
};
