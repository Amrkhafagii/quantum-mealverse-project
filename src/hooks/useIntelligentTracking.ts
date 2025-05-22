
import { useState, useEffect, useCallback } from 'react';
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

  // Use the delivery location service for location tracking
  const locationService = useDeliveryLocationService();
  const { 
    location,
    updateLocation,
    isTracking,
    startTracking,
    stopTracking
  } = locationService;

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
      startTracking();
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
  }, [trackingInterval, orderId, isTracking, startTracking, updateLocation, onLocationUpdate]);

  // Force an immediate location update
  const forceLocationUpdate = useCallback(async () => {
    const updatedLocation = await updateLocation();
    return updatedLocation;
  }, [updateLocation]);

  return {
    location,
    trackingMode,
    trackingInterval,
    batteryLevel,
    isLowBattery,
    distanceToDestination,
    isTracking,
    forceLocationUpdate,
    stopTracking
  };
}
