
import { useState, useEffect, useCallback } from 'react';
import geofencingService, { GeofenceRegion, GeofenceEvent } from '@/utils/geofencingService';
import { useLocationService } from '@/contexts/LocationServiceContext';
import { Platform } from '@/utils/platform';

export interface GeofencingOptions {
  monitoringInterval?: number; // in milliseconds
  batteryEfficient?: boolean;
  dataEfficient?: boolean;
  onGeofenceEvent?: (event: GeofenceEvent) => void;
  activeOnly?: boolean;
}

export function useGeofencing(options: GeofencingOptions = {}) {
  const [regions, setRegions] = useState<GeofenceRegion[]>([]);
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [lastEvent, setLastEvent] = useState<GeofenceEvent | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // Get location from context - fix by accessing currentLocation property
  const { currentLocation } = useLocationService();
  
  // Default options
  const {
    monitoringInterval = 30000, // Default to 30 seconds
    batteryEfficient = false,
    dataEfficient = false,
    onGeofenceEvent,
    activeOnly = false
  } = options;
  
  // Calculate optimized monitoring interval based on options and platform state
  const getOptimizedInterval = useCallback(() => {
    let interval = monitoringInterval;
    
    // Adjust interval based on battery efficiency setting
    if (batteryEfficient) {
      interval = Math.max(interval, 60000); // At least 60 seconds for battery efficiency
    }
    
    // Further optimize based on platform state
    if (Platform.isLowEndDevice()) {
      interval = Math.max(interval, 45000); // At least 45 seconds for low-end devices
    }
    
    return interval;
  }, [monitoringInterval, batteryEfficient]);
  
  // Add a geofence region
  const addRegion = useCallback((region: GeofenceRegion) => {
    // Add to service
    geofencingService.addRegion(region);
    
    // Update state
    setRegions(prevRegions => {
      // Check if region already exists
      const exists = prevRegions.some(r => r.id === region.id);
      if (exists) {
        return prevRegions.map(r => r.id === region.id ? region : r);
      } else {
        return [...prevRegions, region];
      }
    });
    
    return region.id;
  }, []);
  
  // Add multiple geofence regions
  const addRegions = useCallback((newRegions: GeofenceRegion[]) => {
    // Add to service
    const ids = geofencingService.addRegions(newRegions);
    
    // Update state
    setRegions(prevRegions => {
      const regionsMap = new Map(prevRegions.map(r => [r.id, r]));
      
      // Update map with new regions
      newRegions.forEach(region => {
        regionsMap.set(region.id, region);
      });
      
      return Array.from(regionsMap.values());
    });
    
    return ids;
  }, []);
  
  // Remove a geofence region
  const removeRegion = useCallback((regionId: string) => {
    geofencingService.removeRegion(regionId);
    
    setRegions(prevRegions => prevRegions.filter(r => r.id !== regionId));
    setActiveRegions(prev => prev.filter(id => id !== regionId));
    
    return true;
  }, []);
  
  // Clear all regions
  const clearRegions = useCallback(() => {
    geofencingService.clearRegions();
    setRegions([]);
    setActiveRegions([]);
  }, []);
  
  // Start monitoring
  const startMonitoring = useCallback(() => {
    const interval = getOptimizedInterval();
    geofencingService.startMonitoring(interval);
    setIsMonitoring(true);
  }, [getOptimizedInterval]);
  
  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    geofencingService.stopMonitoring();
    setIsMonitoring(false);
  }, []);
  
  // Handle geofence events
  useEffect(() => {
    const handleGeofenceEvent = (event: GeofenceEvent) => {
      // Update active regions
      if (event.eventType === 'enter') {
        setActiveRegions(prev => [...prev, event.regionId]);
      } else if (event.eventType === 'exit') {
        setActiveRegions(prev => prev.filter(id => id !== event.regionId));
      }
      
      // Update last event
      setLastEvent(event);
      
      // Call the user's event handler if provided
      if (onGeofenceEvent) {
        onGeofenceEvent(event);
      }
    };
    
    // Add event listener
    geofencingService.addEventListener('geofenceEvent', handleGeofenceEvent);
    
    return () => {
      geofencingService.removeEventListener('geofenceEvent', handleGeofenceEvent);
    };
  }, [onGeofenceEvent]);
  
  // Process location updates if monitoring is active
  useEffect(() => {
    if (isMonitoring && currentLocation) {
      geofencingService.processLocation(currentLocation);
    }
  }, [isMonitoring, currentLocation]);
  
  // Initialize monitoring based on activeOnly option
  useEffect(() => {
    if (!activeOnly) {
      startMonitoring();
    }
    
    return () => {
      if (!activeOnly) {
        stopMonitoring();
      }
    };
  }, [startMonitoring, stopMonitoring, activeOnly]);
  
  // Filter regions if activeOnly is true
  const visibleRegions = activeOnly ? 
    regions.filter(region => activeRegions.includes(region.id)) : 
    regions;
  
  return {
    regions: visibleRegions,
    activeRegions,
    lastEvent,
    isMonitoring,
    addRegion,
    addRegions,
    removeRegion,
    clearRegions,
    startMonitoring,
    stopMonitoring
  };
}

export default useGeofencing;
