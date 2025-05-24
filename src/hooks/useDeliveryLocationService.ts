
import { useState, useEffect, useCallback } from 'react';
import { useLocationService } from '@/contexts/LocationServiceContext';
import { useMapService } from '@/contexts/MapServiceContext';
import { DeliveryLocation } from '@/types/location';
import { withGoogleMapsErrorHandling } from '@/utils/googleMapsErrorHandler';
import { retryWithBackoff } from '@/utils/retryWithBackoff';
import { toast } from '@/hooks/use-toast';
import { TrackingMode, calculateTrackingMode } from '@/utils/trackingModeCalculator';
import { useBatteryStatus } from './useBatteryStatus';
import { useNetworkQuality } from './useNetworkQuality';

export interface DeliveryLocationServiceOptions {
  enableHighAccuracy?: boolean;
  trackingInterval?: number;
  enableEnergyEfficiency?: boolean;
  persistLocationHistory?: boolean;
  maxHistoryItems?: number;
  trackOnLoad?: boolean;
}

/**
 * Hook for accessing delivery location services with optimized tracking
 */
export function useDeliveryLocationService(options: DeliveryLocationServiceOptions = {}) {
  const locationService = useLocationService();
  const mapService = useMapService();
  const { lastLocation } = locationService;
  const { isLowBattery } = useBatteryStatus();
  const { isLowQuality } = useNetworkQuality();
  
  // Default options
  const {
    enableHighAccuracy = true,
    trackingInterval = 10000,
    enableEnergyEfficiency = true,
    persistLocationHistory = true,
    maxHistoryItems = 100,
    trackOnLoad = false,
  } = options;

  // State
  const [isTracking, setIsTracking] = useState(false);
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('standard');
  const [currentTrackingInterval, setCurrentTrackingInterval] = useState(trackingInterval);
  const [locationHistory, setLocationHistory] = useState<DeliveryLocation[]>([]);
  const [lastKnownLocation, setLastKnownLocation] = useState<DeliveryLocation | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [lastProcessedLocation, setLastProcessedLocation] = useState<DeliveryLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize tracking on load if requested
  useEffect(() => {
    if (trackOnLoad) {
      startTracking().catch(console.error);
    }
    
    // Get initial location permission status
    const checkPermission = async () => {
      try {
        await locationService.requestPermission();
        // Now we have a permission status
      } catch (err) {
        console.error('Error checking location permission:', err);
      }
    };
    
    checkPermission();
    
    // Clean up tracking on unmount
    return () => {
      stopTracking().catch(console.error);
    };
  }, [trackOnLoad]);
  
  // Process location updates
  useEffect(() => {
    if (lastLocation && (!lastProcessedLocation || lastLocation.timestamp !== lastProcessedLocation.timestamp)) {
      setLastProcessedLocation(lastLocation);
      setLastKnownLocation(lastLocation);
      setLastRefreshTime(Date.now());
      
      // Update location history
      if (persistLocationHistory) {
        setLocationHistory(prev => {
          const newHistory = [lastLocation, ...prev];
          return newHistory.slice(0, maxHistoryItems);
        });
      }
      
      // Calculate tracking mode based on current conditions
      updateTrackingMode();
    }
  }, [lastLocation, persistLocationHistory, maxHistoryItems]);
  
  // Start location tracking
  const startTracking = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Request permission first
      await locationService.requestPermission();
      
      // Start tracking with energy efficiency in mind
      const trackingIntervalMs = enableEnergyEfficiency && isLowBattery ? trackingInterval * 2 : trackingInterval;
      const success = await locationService.startTracking({
        enableHighAccuracy: enableHighAccuracy,
        interval: trackingIntervalMs,
      });
      
      setIsTracking(success);
      updateTrackingMode();
      setCurrentTrackingInterval(trackingIntervalMs);
      setIsLoading(false);
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start location tracking');
      setError(error);
      setIsLoading(false);
      setIsTracking(false);
      
      toast({
        variant: "destructive",
        title: "Location Tracking Error",
        description: error.message,
      });
      
      return false;
    }
  }, [enableHighAccuracy, trackingInterval, enableEnergyEfficiency, isLowBattery]);
  
  // Stop location tracking
  const stopTracking = useCallback(async () => {
    try {
      await locationService.stopTracking();
      setIsTracking(false);
    } catch (err) {
      console.error('Error stopping location tracking:', err);
    }
  }, []);
  
  // Refresh current location on demand
  const refreshLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Use retry with backoff for resilience
      const location = await retryWithBackoff(
        async () => locationService.getCurrentLocation(),
        { 
          initialDelayMs: 1000, 
          maxRetries: 3, 
          backoffFactor: 1.5, 
          maxDelayMs: 10000, 
          jitterFactor: 0.2 
        }
      );
      
      if (location) {
        setLastKnownLocation(location);
        setLastRefreshTime(Date.now());
        
        if (persistLocationHistory) {
          setLocationHistory(prev => {
            const newHistory = [location, ...prev];
            return newHistory.slice(0, maxHistoryItems);
          });
        }
        
        return location;
      }
      
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh location');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [persistLocationHistory, maxHistoryItems]);
  
  // Get address from coordinates using geocoding
  const getAddressFromCoordinates = useCallback(async (location: DeliveryLocation): Promise<string | null> => {
    return withGoogleMapsErrorHandling(
      async () => {
        return retryWithBackoff(
          async () => {
            if (!mapService.mapService) {
              throw new Error('Map service not initialized');
            }
            
            // This assumes that mapService has a geocodeReverse method
            // Implement or modify as needed
            const address = await mapService.mapService.geocodeReverse({
              latitude: location.latitude,
              longitude: location.longitude
            });
            
            return address;
          },
          { 
            initialDelayMs: 1000, 
            maxRetries: 2, 
            backoffFactor: 1.5, 
            maxDelayMs: 5000,
            jitterFactor: 0.1 
          }
        );
      },
      {
        showToast: false,
        fallback: null,
        context: 'Geocoding'
      }
    );
  }, [mapService]);
  
  // Update tracking mode based on current conditions
  const updateTrackingMode = useCallback(() => {
    const newMode = calculateTrackingMode({
      isLowBattery,
      isLowQuality,
      forceLowPowerMode: enableEnergyEfficiency,
      orderStatus: 'active', // Can be dynamic based on actual order status
      location: lastKnownLocation
    });
    
    setTrackingMode(newMode.trackingMode);
    
    // Update tracking interval if needed
    if (isTracking && newMode.trackingInterval !== currentTrackingInterval) {
      setCurrentTrackingInterval(newMode.trackingInterval);
      
      // Update tracking parameters on the fly
      locationService.updateTrackingOptions({
        enableHighAccuracy: enableHighAccuracy,
        interval: newMode.trackingInterval
      }).catch(console.error);
    }
  }, [isLowBattery, isLowQuality, enableEnergyEfficiency, lastKnownLocation, isTracking, currentTrackingInterval, enableHighAccuracy]);
  
  // Reset and request a fresh location
  const resetAndRequestLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    // Stop tracking temporarily
    const wasTracking = isTracking;
    if (wasTracking) {
      await stopTracking();
    }
    
    // Clear any cached locations
    locationService.clearCache();
    
    // Restart tracking if needed
    if (wasTracking) {
      await startTracking();
    }
    
    // Get fresh location
    return refreshLocation();
  }, [isTracking, stopTracking, startTracking, refreshLocation]);

  return {
    isTracking,
    trackingMode,
    trackingInterval: currentTrackingInterval,
    lastLocation: lastKnownLocation,
    locationHistory,
    
    startTracking,
    stopTracking,
    refreshLocation,
    getAddressFromCoordinates,
    resetAndRequestLocation,
    
    isLoading,
    error,
    
    // Timestamp of last location update
    lastRefreshTime
  };
}

export default useDeliveryLocationService;
