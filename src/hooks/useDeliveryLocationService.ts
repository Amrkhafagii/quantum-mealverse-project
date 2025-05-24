
import { useState, useEffect, useCallback } from 'react';
import { DeliveryLocation } from '@/types/location';
import { updateDeliveryLocation, getDeliveryLocationHistory } from '@/services/delivery/deliveryLocationService';
import { useLocationService } from '@/contexts/LocationServiceContext';
import { calculateTrackingMode, getTrackingInterval, TrackingMode } from '@/utils/trackingModeCalculator';
import { useBatteryMonitor } from '@/utils/batteryMonitor';
import { Platform } from '@/utils/platform';

interface DeliveryLocationServiceOptions {
  assignmentId?: string;
  orderId?: string;
  orderStatus?: string;
  energyEfficient?: boolean;
  dataEfficient?: boolean;
  minimumBatteryLevel?: number;
  onLocationUpdate?: (location: DeliveryLocation) => void;
}

export function useDeliveryLocationService(options: DeliveryLocationServiceOptions = {}) {
  const { 
    assignmentId, 
    orderId, 
    orderStatus = 'pending', 
    energyEfficient = true,
    dataEfficient = true,
    minimumBatteryLevel = 15,
    onLocationUpdate 
  } = options;
  
  const [isTracking, setIsTracking] = useState(false);
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('medium');
  const [trackingInterval, setTrackingInterval] = useState(30000); // Default: 30 seconds
  const [lastLocation, setLastLocation] = useState<DeliveryLocation | null>(null);
  const [locationHistory, setLocationHistory] = useState<DeliveryLocation[]>([]);
  const [isLowQuality, setIsLowQuality] = useState(false);
  
  // Get current location from LocationService context
  const { currentLocation, startTracking: startLocationTracking, stopTracking: stopLocationTracking } = useLocationService();
  
  // Get battery status
  const { batteryLevel, isLowBattery } = useBatteryMonitor({ 
    minimumBatteryLevel 
  });
  
  // Load location history when assignment ID changes
  useEffect(() => {
    if (!assignmentId) return;
    
    const loadLocationHistory = async () => {
      try {
        const history = await getDeliveryLocationHistory(assignmentId);
        setLocationHistory(history);
      } catch (error) {
        console.error('Error loading location history:', error);
      }
    };
    
    loadLocationHistory();
  }, [assignmentId]);
  
  // Determine network quality
  useEffect(() => {
    const checkNetworkQuality = () => {
      try {
        // @ts-ignore - connection is not in standard TypeScript definitions
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
          const isLow = connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
          setIsLowQuality(isLow);
        } else {
          setIsLowQuality(false);
        }
      } catch (error) {
        console.warn('Network quality check failed:', error);
      }
    };
    
    checkNetworkQuality();
    
    // Try to listen for connection changes
    try {
      // @ts-ignore - connection is not in standard TypeScript definitions
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        connection.addEventListener('change', checkNetworkQuality);
        
        return () => {
          connection.removeEventListener('change', checkNetworkQuality);
        };
      }
    } catch (error) {
      console.warn('Network monitoring setup failed:', error);
    }
  }, []);
  
  // Calculate optimal tracking mode based on conditions
  useEffect(() => {
    if (!currentLocation) return;
    
    const { trackingMode: calculatedMode } = calculateTrackingMode({
      isLowBattery,
      isLowQuality,
      orderStatus,
      location: currentLocation,
      forceLowPowerMode: energyEfficient && Platform.isLowEndDevice() // Add the missing property
    });
    
    setTrackingMode(calculatedMode);
    setTrackingInterval(getTrackingInterval(calculatedMode));
    setLastLocation(currentLocation);
    
    // Call onLocationUpdate callback if provided
    if (onLocationUpdate) {
      onLocationUpdate(currentLocation);
    }
    
    // Update location in backend if tracking is active and assignmentId is provided
    if (isTracking && assignmentId) {
      updateDeliveryLocation(
        assignmentId, 
        currentLocation.latitude, 
        currentLocation.longitude
      ).catch(error => {
        console.error('Error updating delivery location:', error);
      });
    }
  }, [currentLocation, isLowBattery, isLowQuality, orderStatus, energyEfficient, isTracking, assignmentId, onLocationUpdate]);
  
  // Start tracking function
  const startTracking = useCallback(async () => {
    if (!startLocationTracking) return false;
    
    try {
      const started = await startLocationTracking({
        enableHighAccuracy: trackingMode === 'high',
        maximumAge: trackingInterval * 2,
        timeout: trackingInterval / 2
      });
      
      setIsTracking(started);
      return started;
    } catch (error) {
      console.error('Error starting tracking:', error);
      return false;
    }
  }, [startLocationTracking, trackingMode, trackingInterval]);
  
  // Stop tracking function
  const stopTracking = useCallback(async () => {
    if (!stopLocationTracking) return;
    
    try {
      await stopLocationTracking();
      setIsTracking(false);
    } catch (error) {
      console.error('Error stopping tracking:', error);
    }
  }, [stopLocationTracking]);
  
  return {
    isTracking,
    trackingMode,
    trackingInterval,
    lastLocation,
    locationHistory,
    batteryLevel,
    isLowBattery,
    isLowQuality,
    startTracking,
    stopTracking
  };
}

export default useDeliveryLocationService;
