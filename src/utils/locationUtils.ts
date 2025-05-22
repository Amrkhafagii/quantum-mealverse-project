import { DeliveryLocation, LocationFreshness } from '@/types/location';
import { secureStorage } from './secureStorage';

// Constants for secure storage keys
const LOCATION_STORAGE_KEY = 'deliveryLocation';
const ORDERS_STORAGE_KEY = 'cached_orders';
const PENDING_ACTIONS_KEY = 'pending_actions';

/**
 * Save delivery location to secure storage
 */
export const cacheDeliveryLocation = async (location: DeliveryLocation): Promise<boolean> => {
  try {
    return await secureStorage.setItem(LOCATION_STORAGE_KEY, location);
  } catch (error) {
    console.error('Error caching delivery location:', error);
    // Fallback to legacy storage
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
      return true;
    } catch (fallbackError) {
      console.error('Error in fallback storage:', fallbackError);
      return false;
    }
  }
};

/**
 * Get cached delivery location from secure storage
 */
export const getCachedDeliveryLocation = async (): Promise<DeliveryLocation | null> => {
  try {
    // Try to get from secure storage
    const location = await secureStorage.getItem<DeliveryLocation>(LOCATION_STORAGE_KEY);
    if (location) return location;
    
    // Fallback to legacy storage if not found in secure storage
    const legacyLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (legacyLocation) {
      const parsedLocation = JSON.parse(legacyLocation) as DeliveryLocation;
      // Migrate to secure storage
      await secureStorage.setItem(LOCATION_STORAGE_KEY, parsedLocation);
      return parsedLocation;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached delivery location:', error);
    
    // Last resort fallback
    try {
      const legacyLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (legacyLocation) {
        return JSON.parse(legacyLocation) as DeliveryLocation;
      }
    } catch (fallbackError) {
      console.error('Error in fallback retrieval:', fallbackError);
    }
    
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
export const isLocationStale = (timestamp: string, maxAgeSecs: number = 60): boolean => {
  const freshness = calculateLocationFreshness(timestamp);
  return freshness === 'stale' || freshness === 'invalid';
};

/**
 * Calculate location freshness level
 * - fresh: less than 2 minutes old
 * - moderate: 2-5 minutes old
 * - stale: 5-30 minutes old
 * - invalid: older than 30 minutes
 */
export const calculateLocationFreshness = (timestamp: string): LocationFreshness => {
  const locationTimestamp = new Date(timestamp).getTime();
  const currentTimestamp = new Date().getTime();
  const ageInSeconds = Math.floor((currentTimestamp - locationTimestamp) / 1000);
  
  if (ageInSeconds < 120) { // Less than 2 minutes
    return 'fresh';
  } else if (ageInSeconds < 300) { // 2-5 minutes
    return 'moderate';
  } else if (ageInSeconds < 1800) { // 5-30 minutes
    return 'stale';
  } else { // More than 30 minutes
    return 'invalid';
  }
};

/**
 * Cache an order for offline access
 */
export const cacheOrderData = async (orderId: string, orderData: any): Promise<boolean> => {
  try {
    const cachedOrders = await getCachedOrders();
    cachedOrders[orderId] = {
      data: orderData,
      timestamp: Date.now()
    };
    return await secureStorage.setItem(ORDERS_STORAGE_KEY, cachedOrders);
  } catch (error) {
    console.error('Error caching order data:', error);
    // Fallback to localStorage
    try {
      const cachedOrders = getCachedOrdersSync();
      cachedOrders[orderId] = {
        data: orderData,
        timestamp: Date.now()
      };
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(cachedOrders));
      return true;
    } catch (fallbackError) {
      console.error('Error in fallback order caching:', fallbackError);
      return false;
    }
  }
};

/**
 * Get a cached order by ID
 */
export const getCachedOrder = async (orderId: string): Promise<any | null> => {
  try {
    const cachedOrders = await getCachedOrders();
    return cachedOrders[orderId]?.data || null;
  } catch (error) {
    console.error('Error getting cached order:', error);
    // Fallback to localStorage
    try {
      const cachedOrders = getCachedOrdersSync();
      return cachedOrders[orderId]?.data || null;
    } catch (fallbackError) {
      console.error('Error in fallback order retrieval:', fallbackError);
      return null;
    }
  }
};

/**
 * Get all cached orders - async version that uses secure storage
 */
export const getCachedOrders = async (): Promise<Record<string, { data: any, timestamp: number }>> => {
  try {
    const orders = await secureStorage.getItem<Record<string, { data: any, timestamp: number }>>(ORDERS_STORAGE_KEY);
    if (orders) return orders;
    
    // Migrate from localStorage if not in secure storage
    const legacyOrders = getCachedOrdersSync();
    if (Object.keys(legacyOrders).length > 0) {
      await secureStorage.setItem(ORDERS_STORAGE_KEY, legacyOrders);
    }
    
    return legacyOrders;
  } catch (error) {
    console.error('Error getting cached orders:', error);
    return {};
  }
};

/**
 * Synchronous version that uses localStorage - for fallback
 */
export const getCachedOrdersSync = (): Record<string, { data: any, timestamp: number }> => {
  try {
    const cached = localStorage.getItem(ORDERS_STORAGE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error('Error getting cached orders from localStorage:', error);
    return {};
  }
};

/**
 * Clear a cached order by ID
 */
export const clearCachedOrder = async (orderId: string): Promise<boolean> => {
  try {
    const cachedOrders = await getCachedOrders();
    if (cachedOrders[orderId]) {
      delete cachedOrders[orderId];
      return await secureStorage.setItem(ORDERS_STORAGE_KEY, cachedOrders);
    }
    return true;
  } catch (error) {
    console.error('Error clearing cached order:', error);
    // Fallback to localStorage
    try {
      const cachedOrders = getCachedOrdersSync();
      if (cachedOrders[orderId]) {
        delete cachedOrders[orderId];
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(cachedOrders));
      }
      return true;
    } catch (fallbackError) {
      console.error('Error in fallback clear cached order:', fallbackError);
      return false;
    }
  }
};

/**
 * Clear all cached orders
 */
export const clearAllCachedOrders = async (): Promise<boolean> => {
  try {
    await secureStorage.removeItem(ORDERS_STORAGE_KEY);
    localStorage.removeItem(ORDERS_STORAGE_KEY); // Also clear from localStorage
    return true;
  } catch (error) {
    console.error('Error clearing all cached orders:', error);
    return false;
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

/**
 * Securely cache delivery location with encryption
 * This is now a wrapper around our new secure storage implementation
 */
export const securelyStoreLocation = async (location: DeliveryLocation): Promise<void> => {
  const success = await cacheDeliveryLocation(location);
  if (!success) {
    throw new Error('Failed to securely store location');
  }
};

/**
 * Retrieve securely stored location
 * This is now a wrapper around our new secure storage implementation
 */
export const getSecurelyStoredLocation = async (): Promise<DeliveryLocation | null> => {
  return await getCachedDeliveryLocation();
};
