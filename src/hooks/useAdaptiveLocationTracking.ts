import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { BatteryOptimization } from '@/utils/batteryOptimization';
import { AndroidLocationOptimizer } from '@/utils/androidLocationOptimizer';
import { useLocationPermission } from './useLocationPermission';

interface LocationSettings {
  desiredAccuracy: 'high' | 'medium' | 'low';
  updateInterval: number; // milliseconds
  distanceFilter: number; // meters
  isBackgroundEnabled: boolean;
  isMovementDetectionEnabled: boolean;
}

interface AdaptiveLocationOptions {
  initialSettings?: Partial<LocationSettings>;
  onLocationUpdate?: (location: GeolocationPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
}

export const useAdaptiveLocationTracking = (options: AdaptiveLocationOptions = {}) => {
  const { permissionStatus, backgroundPermissionStatus } = useLocationPermission();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [settings, setSettings] = useState<LocationSettings>({
    desiredAccuracy: 'medium',
    updateInterval: 10000, // 10 seconds
    distanceFilter: 10, // 10 meters
    isBackgroundEnabled: false,
    isMovementDetectionEnabled: true,
    ...options.initialSettings
  });

  // Refs to store watch IDs and previous locations
  const watchIdRef = useRef<number | null>(null);
  const previousLocationsRef = useRef<GeolocationPosition[]>([]);
  const batteryOptimizationRef = useRef<BatteryOptimization | null>(null);

  // Initialize battery optimization on mount
  useEffect(() => {
    batteryOptimizationRef.current = new BatteryOptimization();
    
    return () => {
      // Clean up any battery monitoring
      if (batteryOptimizationRef.current) {
        // Any cleanup needed
      }
    };
  }, []);

  // Effect to handle permission changes
  useEffect(() => {
    if (permissionStatus === 'granted') {
      // We have foreground permission, check if we need background
      if (settings.isBackgroundEnabled && backgroundPermissionStatus !== 'granted') {
        console.log('Background location permission needed for full functionality');
      }
    }
  }, [permissionStatus, backgroundPermissionStatus, settings.isBackgroundEnabled]);

  // Effect to adjust settings based on battery status
  useEffect(() => {
    const checkBatteryAndAdjustSettings = async () => {
      const batteryLevel = await BatteryOptimization.getBatteryLevel();
      const isLowPower = await BatteryOptimization.isLowPowerModeEnabled();

      // Adjust settings based on battery status
      if (batteryLevel < 20 || isLowPower) {
        setSettings(prev => ({
          ...prev,
          updateInterval: Math.max(prev.updateInterval, 30000), // At least 30 seconds
          desiredAccuracy: 'low'
        }));
      }
    };
    
    // Check battery status when tracking starts and periodically
    if (isTracking) {
      checkBatteryAndAdjustSettings();
      
      const intervalId = setInterval(checkBatteryAndAdjustSettings, 60000); // Check every minute
      
      return () => clearInterval(intervalId);
    }
  }, [isTracking]);

  // Function to detect if user is moving
  const detectMovement = (position: GeolocationPosition) => {
    const locations = previousLocationsRef.current;
    
    // Add current location to history, keeping last 5
    locations.push(position);
    if (locations.length > 5) {
      locations.shift();
    }
    
    // Need at least 3 locations to detect movement
    if (locations.length < 3) {
      return false;
    }
    
    // Calculate if there's significant movement
    let isSignificantMovement = false;
    const latest = locations[locations.length - 1];
    const oldest = locations[0];
    
    // Simple distance calculation (could be enhanced with haversine formula)
    const latDiff = Math.abs(latest.coords.latitude - oldest.coords.latitude);
    const lngDiff = Math.abs(latest.coords.longitude - oldest.coords.longitude);
    
    // Rough approximation - 0.0001 degrees is about 10 meters
    isSignificantMovement = (latDiff > 0.0001 || lngDiff > 0.0001);
    
    return isSignificantMovement;
  };

  // Start location tracking
  const startTracking = async () => {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      setError('Geolocation is not available');
      return;
    }
    
    if (permissionStatus !== 'granted') {
      setError('Location permission not granted');
      return;
    }
    
    try {
      // Stop any existing tracking
      stopTracking();
      
      // Get optimal interval based on current conditions
      const interval = await BatteryOptimization.getOptimalUpdateInterval();
      
      // Update settings with optimized values
      setSettings(prev => ({
        ...prev,
        updateInterval: interval
      }));
      
      // Configure platform-specific optimizations
      if (Capacitor.getPlatform() === 'android') {
        await configureAndroidTracking();
      }
      
      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        handlePositionError,
        {
          enableHighAccuracy: settings.desiredAccuracy === 'high',
          timeout: 30000,
          maximumAge: settings.updateInterval / 2
        }
      );
      
      setIsTracking(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start location tracking');
    }
  };

  // Configure Android-specific tracking optimizations
  const configureAndroidTracking = async () => {
    if (Capacitor.getPlatform() !== 'android') return;
    
    try {
      const options = await AndroidLocationOptimizer.getLocationRequestOptions({
        isMoving,
        baseInterval: settings.updateInterval
      });
      
      // This would be implemented with a Capacitor plugin
      console.log('Configured Android tracking with options:', options);
    } catch (err) {
      console.error('Error configuring Android tracking:', err);
    }
  };

  // Handle position updates
  const handlePositionUpdate = (position: GeolocationPosition) => {
    setCurrentLocation(position);
    setError(null);
    
    // Detect movement if enabled
    if (settings.isMovementDetectionEnabled) {
      const moving = detectMovement(position);
      if (moving !== isMoving) {
        setIsMoving(moving);
      }
    }
    
    // Call the callback if provided
    if (options.onLocationUpdate) {
      options.onLocationUpdate(position);
    }
  };

  // Handle position errors
  const handlePositionError = (error: GeolocationPositionError) => {
    setError(`Location error: ${error.message}`);
    
    if (options.onError) {
      options.onError(error);
    }
  };

  // Stop location tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  // Update tracking settings
  const updateSettings = (newSettings: Partial<LocationSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
    
    // Restart tracking if already tracking to apply new settings
    if (isTracking) {
      stopTracking();
      startTracking();
    }
  };

  return {
    startTracking,
    stopTracking,
    updateSettings,
    isTracking,
    currentLocation,
    error,
    isMoving,
    settings,
    permissionStatus,
    backgroundPermissionStatus
  };
};
