import { useState, useEffect, useCallback, useRef } from 'react';
import { DeliveryLocation } from '@/types/location';
import { useLocationPermissions } from '@/hooks/useLocationPermissions';
import { useAdaptiveLocationTracking } from '@/hooks/useAdaptiveLocationTracking';
import { useDeliveryLocationCache } from '@/hooks/useDeliveryLocationCache';
import { useBatteryMonitor } from '@/utils/batteryMonitor';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { calculateTrackingMode } from '@/utils/trackingModeCalculator';

// Import LocationFreshness from unifiedLocation
import { LocationFreshness } from '@/types/unifiedLocation';

interface DeliveryLocationMap {
  [key: string]: {
    location: DeliveryLocation;
    freshness: LocationFreshness;
  };
}

export function useDeliveryLocationService() {
  const { permissionStatus, requestPermissions } = useLocationPermissions();
  const cache = useDeliveryLocationCache();
  const [activeDeliveries, setActiveDeliveries] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(30000); // 30 seconds default
  const [error, setError] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [freshness, setFreshness] = useState<LocationFreshness>('fresh');
  const { batteryLevel, isLowBattery } = useBatteryMonitor();
  const { isOnline } = useConnectionStatus();
  const [location, setLocation] = useState<DeliveryLocation | null>(null);
  
  // Use adaptive location tracking
  const adaptiveTracking = useAdaptiveLocationTracking({
    onLocationUpdate: (loc) => {
      setLocation(loc);
      setLastUpdated(Date.now());
      setFreshness('fresh');
      
      // Update all active deliveries with this location
      activeDeliveries.forEach(id => {
        cache.cacheLocation(id, loc);
      });
    },
    batteryAware: true,
    enableAdaptiveSampling: true
  });
  
  // Extract methods from adaptiveTracking
  const { 
    startTracking: startAdaptiveTracking, 
    stopTracking: stopAdaptiveTracking,
    isBackgroundTracking
  } = adaptiveTracking;
  
  // Update all locations
  const updateLocations = useCallback(async () => {
    if (isUpdating || activeDeliveries.size === 0) return [];
    
    try {
      setIsUpdating(true);
      
      // In a real implementation, you would fetch actual location data here
      // For demo purposes, we'll simulate an update with the current location
      if (location) {
        activeDeliveries.forEach(id => {
          cache.cacheLocation(id, location);
        });
        setLastUpdated(Date.now());
        setFreshness('fresh');
      }
      
      return Array.from(activeDeliveries);
    } catch (err) {
      setError('Failed to update locations');
      console.error('Failed to update locations:', err);
      return [];
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, activeDeliveries, cache, location]);
  
  // Start tracking when needed
  useEffect(() => {
    if (activeDeliveries.size > 0 && !isTracking && permissionStatus === 'granted') {
      startAdaptiveTracking();
      setIsTracking(true);
    } else if (activeDeliveries.size === 0 && isTracking) {
      stopAdaptiveTracking();
      setIsTracking(false);
    }
  }, [activeDeliveries, isTracking, permissionStatus, startAdaptiveTracking, stopAdaptiveTracking]);
  
  // Calculate update interval based on conditions
  useEffect(() => {
    const { trackingMode } = calculateTrackingMode({
      isLowBattery,
      isLowQuality: !isOnline,
      orderStatus: activeDeliveries.size > 0 ? 'pickedup' : 'accepted',
      location
    });
    
    let interval = 30000; // Default 30 seconds
    
    switch (trackingMode) {
      case 'high':
        interval = 10000; // 10 seconds
        break;
      case 'medium':
        interval = 30000; // 30 seconds
        break;
      case 'low':
        interval = 60000; // 1 minute
        break;
      case 'minimal':
        interval = 120000; // 2 minutes
        break;
    }
    
    setUpdateInterval(interval);
  }, [isOnline, isLowBattery, activeDeliveries, location]);
  
  // Register a delivery for tracking
  const registerDelivery = useCallback((deliveryId: string) => {
    setActiveDeliveries(prev => {
      const updated = new Set(prev);
      updated.add(deliveryId);
      return updated;
    });
  }, []);
  
  // Unregister a delivery
  const unregisterDelivery = useCallback((deliveryId: string) => {
    setActiveDeliveries(prev => {
      const updated = new Set(prev);
      updated.delete(deliveryId);
      return updated;
    });
  }, []);
  
  // Get location for a specific delivery
  const getDeliveryLocation = useCallback((deliveryId: string) => {
    return cache.getLocation(deliveryId);
  }, [cache]);
  
  // Update location manually
  const updateLocation = useCallback(async () => {
    if (!location) return null;
    setLastUpdated(Date.now());
    setFreshness('fresh');
    return location;
  }, [location]);

  // Check if location is stale
  const isLocationStale = useCallback(() => {
    if (!lastUpdated) return true;
    const now = Date.now();
    return now - lastUpdated > 300000; // 5 minutes
  }, [lastUpdated]);

  // Reset and request a new location
  const resetAndRequestLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    try {
      if (permissionStatus !== 'granted') {
        await requestPermissions();
      }
      
      if (isTracking) {
        await stopAdaptiveTracking();
        await startAdaptiveTracking();
      } else {
        await startAdaptiveTracking();
        setIsTracking(true);
      }
      
      // Return the current location or null
      return location;
    } catch (error) {
      console.error('Error resetting location:', error);
      return null;
    }
  }, [permissionStatus, requestPermissions, isTracking, startAdaptiveTracking, stopAdaptiveTracking, location]);

  // Check if location is valid
  const locationIsValid = useCallback(() => {
    return location !== null && !isLocationStale();
  }, [location, isLocationStale]);
  
  // Add startTracking and stopTracking methods for API consistency
  const startTracking = useCallback(async () => {
    await startAdaptiveTracking();
    setIsTracking(true);
  }, [startAdaptiveTracking]);
  
  const stopTracking = useCallback(() => {
    stopAdaptiveTracking();
    setIsTracking(false);
  }, [stopAdaptiveTracking]);
  
  return {
    // For the DeliveryLocationService
    registerDelivery,
    unregisterDelivery,
    getDeliveryLocation,
    updateLocations,
    isUpdating,
    updateInterval,
    
    // Location data
    location,
    permissionStatus,
    isStale: isLocationStale(),
    freshness,
    lastUpdated,
    
    // Location methods
    updateLocation,
    resetAndRequestLocation,
    startTracking,
    stopTracking,
    
    // Status
    error,
    isTracking,
    isBackgroundTracking,
    locationIsValid,
    isBatteryLow: isLowBattery,
    batteryLevel
  };
}
