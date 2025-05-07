
import { useState, useEffect, useCallback } from 'react';
import { useLocationTracker } from './useLocationTracker';
import { useDeliveryLocationService } from './useDeliveryLocationService';
import { useNetworkQuality } from './useNetworkQuality';
import { calculateDistance } from '@/utils/locationUtils';
import { DeliveryLocation } from '@/types/location';
import { Capacitor } from '@capacitor/core';

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
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isLowBattery, setIsLowBattery] = useState(false);
  const [trackingMode, setTrackingMode] = useState<'high' | 'medium' | 'low' | 'minimal'>('medium');
  const [trackingInterval, setTrackingInterval] = useState(30000); // 30 seconds default
  const [distanceToDestination, setDistanceToDestination] = useState<number | null>(null);
  const isNative = Capacitor.isNativePlatform();

  // Use the delivery location service for location tracking
  const { 
    location,
    updateLocation,
    isTracking,
    startTracking,
    stopTracking
  } = useDeliveryLocationService();

  // Monitor device battery level if available on this platform
  useEffect(() => {
    if (!isNative) return;

    const checkBattery = async () => {
      try {
        // Use Capacitor to get battery info if available
        if ('BatteryStatus' in window) {
          // @ts-ignore - Using Capacitor plugin that might not be typed
          const batteryInfo = await window.BatteryStatus.getBatteryStatus();
          if (batteryInfo && typeof batteryInfo.batteryLevel === 'number') {
            const level = Math.round(batteryInfo.batteryLevel * 100);
            setBatteryLevel(level);
            setIsLowBattery(level <= minimumBatteryLevel);
          }
        }
      } catch (error) {
        console.error('Error getting battery status:', error);
      }
    };

    // Initial check
    checkBattery();

    // Set up interval for periodic checks
    const batteryCheckInterval = setInterval(checkBattery, 60000); // Check every minute

    return () => clearInterval(batteryCheckInterval);
  }, [isNative, minimumBatteryLevel]);

  // Calculate distance to destination based on current location and order details
  useEffect(() => {
    if (!location) return;

    // Determine the relevant destination based on order status
    let destination = null;
    
    if (orderStatus === 'accepted' || orderStatus === 'preparing') {
      // Heading to restaurant
      destination = restaurantLocation;
    } else if (orderStatus === 'picked_up' || orderStatus === 'on_the_way') {
      // Heading to customer
      destination = customerLocation;
    }

    // Calculate distance if we have a destination
    if (destination && destination.latitude && destination.longitude) {
      const distance = calculateDistance(
        location.latitude, 
        location.longitude,
        destination.latitude,
        destination.longitude
      );
      
      setDistanceToDestination(distance);
    } else {
      setDistanceToDestination(null);
    }
  }, [location, orderStatus, customerLocation, restaurantLocation]);

  // Determine optimal tracking mode based on all factors
  useEffect(() => {
    // Start with the default mode
    let newTrackingMode: 'high' | 'medium' | 'low' | 'minimal' = 'medium';
    
    // Force low power mode if specified
    if (forceLowPowerMode) {
      newTrackingMode = 'minimal';
    } 
    // Low battery takes precedence for battery conservation
    else if (isLowBattery) {
      newTrackingMode = 'low';
    } 
    // Network quality affects battery usage and data consumption
    else if (isLowQuality) {
      newTrackingMode = 'low';
    }
    // Order status and proximity based adjustments
    else if (orderStatus && distanceToDestination !== null) {
      if (orderStatus === 'delivered' || orderStatus === 'cancelled') {
        // Lowest priority - order is complete
        newTrackingMode = 'minimal';
      }
      else if (orderStatus === 'on_the_way' && distanceToDestination < 1) {
        // Highest priority - very close to customer
        newTrackingMode = 'high';
      }
      else if ((orderStatus === 'accepted' || orderStatus === 'preparing') && distanceToDestination < 0.5) {
        // High priority - close to restaurant for pickup
        newTrackingMode = 'high';
      }
      else if (orderStatus === 'on_the_way' && distanceToDestination < 5) {
        // Medium-high priority - approaching customer
        newTrackingMode = 'medium';
      }
    }
    
    setTrackingMode(newTrackingMode);
  }, [isLowBattery, isLowQuality, orderStatus, distanceToDestination, forceLowPowerMode]);

  // Update tracking interval based on tracking mode
  useEffect(() => {
    switch (trackingMode) {
      case 'high':
        setTrackingInterval(10000); // 10 seconds
        break;
      case 'medium':
        setTrackingInterval(30000); // 30 seconds
        break;
      case 'low':
        setTrackingInterval(60000); // 1 minute
        break;
      case 'minimal':
        setTrackingInterval(180000); // 3 minutes
        break;
    }
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
