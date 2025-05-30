import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LocationConfig,
  LocationPermissionStatus,
  LocationError,
  LocationWatchOptions,
  LocationWatchCallback,
  LocationData as LocationState,
  LocationAccuracy,
  LocationBackgroundMode,
} from '@/types/location';
import { locationManager } from '@/utils/locationManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useResponsive } from '@/responsive/core/ResponsiveContext';

interface LocationStateManagerProps {
  children: (location: LocationState) => React.ReactNode;
  defaultConfig?: Partial<LocationConfig>;
}

const defaultLocationConfig: LocationConfig = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 30000,
  trackingMode: 'passive',
  backgroundMode: 'none',
  distanceFilter: 10,
  desiredAccuracy: 'high',
};

const LocationStateManager: React.FC<LocationStateManagerProps> = ({ children, defaultConfig }) => {
  const [location, setLocation] = useState<LocationState>({
    current: null,
    isTracking: false,
    permission: 'prompt',
    error: null,
    config: { ...defaultLocationConfig, ...(defaultConfig || {}) },
    history: [],
  });
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();

  const updateLocation = useCallback(
    (newLocation: LocationState['current'], error?: LocationError) => {
      setLocation((prev) => ({
        ...prev,
        current: newLocation,
        error: error || null,
        history: newLocation ? [...prev.history, {
          id: Date.now().toString(),
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          accuracy: newLocation.accuracy || 0,
          timestamp: newLocation.timestamp,
          source: newLocation.source || 'gps',
        }] : prev.history,
      }));
    },
    []
  );

  const handleLocationUpdate: LocationWatchCallback = useCallback(
    (newLocation, error) => {
      updateLocation(newLocation, error);
    },
    [updateLocation]
  );

  const startTracking = useCallback(() => {
    setLocation((prev) => ({ ...prev, isTracking: true }));
    locationManager.startWatching(handleLocationUpdate, {
      enableHighAccuracy: location.config.enableHighAccuracy,
      timeout: location.config.timeout,
      maximumAge: location.config.maximumAge,
    });
  }, [handleLocationUpdate, location.config]);

  const stopTracking = useCallback(() => {
    setLocation((prev) => ({ ...prev, isTracking: false }));
    locationManager.stopWatching(handleLocationUpdate);
  }, [handleLocationUpdate]);

  useEffect(() => {
    if (location.isTracking) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [location.isTracking, startTracking, stopTracking]);

  return children(location);
};

export default LocationStateManager;
