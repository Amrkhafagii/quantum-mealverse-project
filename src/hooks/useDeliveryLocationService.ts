
import { useState, useEffect, useCallback } from 'react';
import { DeliveryLocation } from '@/types/location';
import { updateDeliveryLocation, getDeliveryLocationHistory } from '@/services/delivery/deliveryLocationService';
import { useLocationService } from '@/contexts/LocationServiceContext';
import { calculateTrackingMode, getTrackingInterval, TrackingMode } from '@/utils/trackingModeCalculator';
import { useBatteryMonitor } from '@/utils/batteryMonitor';
import { Platform } from '@/utils/platform';
import { retryWithBackoff } from '@/utils/retryWithExponentialBackoff';
import { toast } from 'sonner';

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
  const [freshness, setFreshness] = useState<'fresh'|'stale'|'invalid'>('invalid');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  // Get current location from LocationService context
  const { currentLocation, startTracking: startLocationTracking, stopTracking: stopLocationTracking, getPermissionStatus } = useLocationService();
  
  // Get battery status
  const { batteryLevel, isLowBattery } = useBatteryMonitor({ 
    minimumBatteryLevel 
  });

  // Get permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const status = await getPermissionStatus();
        setPermissionStatus(status);
      } catch (err) {
        console.error('Failed to get permission status:', err);
      }
    };
    
    checkPermission();
  }, [getPermissionStatus]);
  
  // Load location history when assignment ID changes
  useEffect(() => {
    if (!assignmentId) return;
    
    const loadLocationHistory = async () => {
      try {
        setIsUpdating(true);
        setError(null);
        // Use retry with backoff for resilient loading
        const history = await retryWithBackoff(
          async () => getDeliveryLocationHistory(assignmentId),
          {
            initialDelayMs: 1000,
            maxRetries: 3,
            maxDelayMs: 10000,
            jitterFactor: 0.1
          }
        );
        setLocationHistory(history as DeliveryLocation[]);
      } catch (error) {
        console.error('Error loading location history:', error);
        setError(error instanceof Error ? error : new Error('Failed to load location history'));
        toast.error('Failed to load location history. Please try again.');
      } finally {
        setIsUpdating(false);
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
      forceLowPowerMode: energyEfficient && Platform.isLowEndDevice() 
    });
    
    setTrackingMode(calculatedMode);
    setTrackingInterval(getTrackingInterval(calculatedMode));
    setLastLocation(currentLocation);
    setLastUpdated(new Date());
    setFreshness('fresh');
    
    // Call onLocationUpdate callback if provided
    if (onLocationUpdate) {
      onLocationUpdate(currentLocation);
    }
    
    // Update location in backend if tracking is active and assignmentId is provided
    if (isTracking && assignmentId) {
      updateLocationWithRetry(assignmentId, currentLocation);
    }
  }, [currentLocation, isLowBattery, isLowQuality, orderStatus, energyEfficient, isTracking, assignmentId, onLocationUpdate]);
  
  // Helper function to update location with retry logic
  const updateLocationWithRetry = useCallback(async (assignmentId: string, location: DeliveryLocation) => {
    try {
      await retryWithBackoff(
        () => updateDeliveryLocation(assignmentId, location.latitude, location.longitude),
        {
          initialDelayMs: 500,
          maxRetries: 2,
          maxDelayMs: 5000,
          jitterFactor: 0.1
        }
      );
    } catch (error) {
      console.error('Error updating delivery location:', error);
      // Don't show toast for every failed update to avoid spamming the user
      // Only log to console for debugging
    }
  }, []);
  
  // Update freshness based on last update time
  useEffect(() => {
    if (!lastUpdated) return;
    
    const updateFreshness = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdated.getTime();
      
      if (diff > 300000) { // 5 minutes
        setFreshness('invalid');
      } else if (diff > 60000) { // 1 minute
        setFreshness('stale');
      }
    };
    
    const interval = setInterval(updateFreshness, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [lastUpdated]);
  
  // Function to manually update location
  const updateLocation = useCallback(async () => {
    if (!currentLocation) return null;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      if (assignmentId) {
        await updateLocationWithRetry(assignmentId, currentLocation);
      }
      
      setFreshness('fresh');
      setLastUpdated(new Date());
      
      return currentLocation;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to update location'));
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [currentLocation, assignmentId, updateLocationWithRetry]);
  
  // Function to request location permission and try to get location
  const resetAndRequestLocation = useCallback(async () => {
    try {
      setError(null);
      setIsUpdating(true);
      
      const status = await getPermissionStatus();
      setPermissionStatus(status);
      
      if (status !== 'granted') {
        return null;
      }
      
      return await updateLocation();
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to get location permission'));
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [getPermissionStatus, updateLocation]);
  
  // Start tracking function
  const startTracking = useCallback(async () => {
    if (!startLocationTracking) return false;
    
    try {
      setError(null);
      
      const started = await startLocationTracking({
        enableHighAccuracy: trackingMode === 'high',
        maximumAge: trackingInterval * 2,
        timeout: trackingInterval / 2
      });
      
      setIsTracking(started);
      return started;
    } catch (error) {
      console.error('Error starting tracking:', error);
      setError(error instanceof Error ? error : new Error('Failed to start tracking'));
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
      setError(error instanceof Error ? error : new Error('Failed to stop tracking'));
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
    stopTracking,
    // Additional properties for the TypeScript errors
    permissionStatus,
    freshness,
    lastUpdated,
    isUpdating,
    error,
    updateLocation,
    resetAndRequestLocation
  };
}

export default useDeliveryLocationService;
