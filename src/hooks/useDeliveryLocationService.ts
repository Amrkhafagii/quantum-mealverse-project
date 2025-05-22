
import { useState, useCallback, useEffect } from 'react';
import { DeliveryLocation, LocationFreshness } from '@/types/location';
import { useLocationTracker } from './useLocationTracker';
import { useDeliveryLocationCache } from './useDeliveryLocationCache';

export const useDeliveryLocationService = () => {
  const [activeDeliveryIds, setActiveDeliveryIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateInterval, setUpdateInterval] = useState<number>(60000); // 1 minute default
  const [error, setError] = useState<Error | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isBatteryLow, setIsBatteryLow] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [freshness, setFreshness] = useState<LocationFreshness>('fresh');
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
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
    if (isUpdating || activeDeliveryIds.length === 0) return null;
    
    try {
      setIsUpdating(true);
      const currentLocation = location || await getCurrentLocation();
      
      if (currentLocation) {
        // Update all active delivery locations
        for (const deliveryId of activeDeliveryIds) {
          cacheLocation(deliveryId, currentLocation);
        }
        
        setLastUpdated(Date.now());
        setFreshness('fresh');
        setIsStale(false);
        return currentLocation;
      }
      return null;
    } catch (err) {
      console.error('Error updating delivery locations:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating locations'));
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [activeDeliveryIds, isUpdating, location, getCurrentLocation, cacheLocation]);

  // Wrapper for updateLocations that returns a promise with the updated location
  const updateLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    return await updateLocations();
  }, [updateLocations]);
  
  // Reset and request new location with permissions checks
  const resetAndRequestLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    try {
      setError(null);
      // Request permissions if needed
      setPermissionStatus('granted'); // Mock for now, should check actual permissions
      
      const result = await getCurrentLocation();
      if (result) {
        setLastUpdated(Date.now());
        setFreshness('fresh');
        setIsStale(false);
      }
      return result;
    } catch (err) {
      console.error('Error resetting location:', err);
      setError(err instanceof Error ? err : new Error('Failed to reset location'));
      return null;
    }
  }, [getCurrentLocation]);

  // Start tracking location
  const startTracking = useCallback(() => {
    setIsTracking(true);
    // Additional implementation would go here in a real app
  }, []);

  // Stop tracking location
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    // Additional implementation would go here in a real app
  }, []);
  
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
  
  // Battery level check (mock implementation)
  useEffect(() => {
    const checkBattery = async () => {
      try {
        // Mock implementation
        const level = Math.floor(Math.random() * 100);
        setBatteryLevel(level);
        setIsBatteryLow(level < 20);
      } catch (e) {
        console.error('Error checking battery:', e);
      }
    };
    
    checkBattery();
    const intervalId = setInterval(checkBattery, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Set up periodic updates
  useEffect(() => {
    if (activeDeliveryIds.length === 0) return;
    
    const intervalId = setInterval(updateLocations, updateInterval);
    
    // Initial update
    updateLocations();
    
    return () => clearInterval(intervalId);
  }, [activeDeliveryIds, updateLocations, updateInterval]);
  
  return {
    // Original properties
    registerDelivery,
    unregisterDelivery,
    getDeliveryLocation,
    updateLocations,
    isUpdating,
    updateInterval,
    
    // Added properties to match expectations from components
    location,
    error,
    updateLocation,
    resetAndRequestLocation,
    isTracking,
    permissionStatus,
    isStale,
    freshness,
    lastUpdated,
    batteryLevel,
    isBatteryLow,
    startTracking,
    stopTracking
  };
};
