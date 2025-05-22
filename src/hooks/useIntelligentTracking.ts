
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDeliveryLocationService } from './useDeliveryLocationService';
import { useNetworkQuality } from './useNetworkQuality';
import { DeliveryLocation } from '@/types/location';
import { useBatteryMonitor } from '@/utils/batteryMonitor';
import { calculateTrackingMode, getTrackingInterval, TrackingMode } from '@/utils/trackingModeCalculator';

interface IntelligentTrackingOptions {
  orderId?: string;
  orderStatus?: string;
  customerLocation?: { latitude: number; longitude: number };
  restaurantLocation?: { latitude: number; longitude: number };
  onLocationUpdate?: (location: DeliveryLocation) => void;
  minimumBatteryLevel?: number; // Threshold to reduce tracking frequency
  forceLowPowerMode?: boolean;
}

export function useIntelligentTracking({
  orderId,
  orderStatus = 'pending',
  customerLocation,
  restaurantLocation,
  onLocationUpdate,
  minimumBatteryLevel = 15,
  forceLowPowerMode = false
}: IntelligentTrackingOptions = {}) {
  const { quality, isLowQuality } = useNetworkQuality();
  const { batteryLevel, isLowBattery } = useBatteryMonitor({ minimumBatteryLevel });
  
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('medium');
  const [trackingInterval, setTrackingInterval] = useState(30000); // 30 seconds default
  const [distanceToDestination, setDistanceToDestination] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation | null>(null);

  // Use the delivery location service for location tracking
  const locationService = useDeliveryLocationService();
  
  // Extract only the properties we need
  const location = locationService.location;
  const isTracking = locationService.isTracking || false;
  
  // Define wrapper methods for location tracking
  const updateLocation = async () => {
    const result = await locationService.updateLocation?.();
    if (result && onLocationUpdate) {
      onLocationUpdate(result);
      setCurrentLocation(result);
    }
    return result || null;
  };
  
  // Determine optimal tracking mode based on all factors
  useEffect(() => {
    const result = calculateTrackingMode({
      isLowBattery,
      isLowQuality,
      orderStatus,
      location,
      customerLocation,
      restaurantLocation,
      forceLowPowerMode
    });
    
    setTrackingMode(result.trackingMode);
    setDistanceToDestination(result.distanceToDestination);
  }, [isLowBattery, isLowQuality, orderStatus, location, customerLocation, restaurantLocation, forceLowPowerMode]);

  // Update tracking interval based on tracking mode
  useEffect(() => {
    setTrackingInterval(getTrackingInterval(trackingMode));
  }, [trackingMode]);

  // Start tracking with the calculated interval
  useEffect(() => {
    if (!isTracking && orderId) {
      // Start tracking if we have an order and we're not already tracking
      locationService.startTracking && locationService.startTracking();
    }
    
    // Set up the interval for location updates
    const intervalId = setInterval(() => {
      if (orderId) {
        updateLocation().then(location => {
          if (location && onLocationUpdate) {
            onLocationUpdate(location);
          }
        });
      }
    }, trackingInterval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [trackingInterval, orderId, isTracking]);

  // Force an immediate location update
  const forceLocationUpdate = useCallback(async () => {
    const updatedLocation = await updateLocation();
    return updatedLocation;
  }, [updateLocation]);

  return {
    location: currentLocation || location,
    trackingMode,
    trackingInterval,
    batteryLevel,
    isLowBattery,
    distanceToDestination,
    isTracking,
    forceLocationUpdate,
    stopTracking: locationService.stopTracking
  };
}
