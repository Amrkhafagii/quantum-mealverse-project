
import { useState, useCallback, useEffect } from 'react';
import { DeliveryLocation, LocationFreshness } from '@/types/location';
import { useLocationTracker } from './useLocationTracker';
import { useDeliveryLocationCache } from './useDeliveryLocationCache';

export const useDeliveryLocationService = () => {
  const [activeDeliveryIds, setActiveDeliveryIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateInterval, setUpdateInterval] = useState<number>(60000); // 1 minute default
  
  const { location, getCurrentLocation } = useLocationTracker();
  const { cacheLocation, getCachedLocation, getCacheFreshness } = useDeliveryLocationCache();
  
  // Register a delivery to be tracked
  const registerDelivery = useCallback((deliveryId: string) => {
    setActiveDeliveryIds(prev => {
      if (prev.includes(deliveryId)) return prev;
      return [...prev, deliveryId];
    });
  }, []);
  
  // Unregister a delivery
  const unregisterDelivery = useCallback((deliveryId: string) => {
    setActiveDeliveryIds(prev => prev.filter(id => id !== deliveryId));
  }, []);
  
  // Get location for a specific delivery
  const getDeliveryLocation = useCallback((deliveryId: string): {
    location: DeliveryLocation | null;
    freshness: LocationFreshness;
  } => {
    const cachedLocation = getCachedLocation(deliveryId);
    const freshness = getCacheFreshness(deliveryId);
    
    return {
      location: cachedLocation,
      freshness
    };
  }, [getCachedLocation, getCacheFreshness]);
  
  // Update all active delivery locations
  const updateLocations = useCallback(async () => {
    if (isUpdating || activeDeliveryIds.length === 0) return;
    
    try {
      setIsUpdating(true);
      const currentLocation = location || await getCurrentLocation();
      
      if (currentLocation) {
        // Update all active delivery locations
        for (const deliveryId of activeDeliveryIds) {
          cacheLocation(deliveryId, currentLocation);
        }
      }
    } catch (error) {
      console.error('Error updating delivery locations:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [activeDeliveryIds, isUpdating, location, getCurrentLocation, cacheLocation]);
  
  // Set update interval based on number of active deliveries
  useEffect(() => {
    // Adjust update interval based on number of active deliveries
    if (activeDeliveryIds.length === 0) {
      setUpdateInterval(60000); // 1 minute when no active deliveries
    } else if (activeDeliveryIds.length === 1) {
      setUpdateInterval(30000); // 30 seconds with one active delivery
    } else {
      setUpdateInterval(15000); // 15 seconds with multiple active deliveries
    }
  }, [activeDeliveryIds]);
  
  // Set up periodic updates
  useEffect(() => {
    if (activeDeliveryIds.length === 0) return;
    
    const intervalId = setInterval(updateLocations, updateInterval);
    
    // Initial update
    updateLocations();
    
    return () => clearInterval(intervalId);
  }, [activeDeliveryIds, updateLocations, updateInterval]);
  
  return {
    registerDelivery,
    unregisterDelivery,
    getDeliveryLocation,
    updateLocations,
    isUpdating,
    updateInterval
  };
};
