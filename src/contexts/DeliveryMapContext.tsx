
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface DriverLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type: 'driver';
}

interface DeliveryMapContextType {
  selectedDeliveryId: string | null;
  setSelectedDeliveryId: (id: string | null) => void;
  driverLocation: DriverLocation | null;
  updateDriverLocation: (location: DriverLocation) => void;
  mapZoom: number;
  setMapZoom: React.Dispatch<React.SetStateAction<number>>;
  isNativeMap: boolean;
  isBackgroundTrackingEnabled: boolean;
  setBackgroundTrackingEnabled: (enabled: boolean) => void;
}

const DeliveryMapContext = createContext<DeliveryMapContextType | null>(null);

export const DeliveryMapProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(14);
  const [isBackgroundTrackingEnabled, setBackgroundTrackingEnabled] = useState<boolean>(false);
  const isNativeMap = Capacitor.isNativePlatform();
  
  const updateDriverLocation = useCallback((location: DriverLocation) => {
    setDriverLocation(location);
  }, []);
  
  // Load persisted settings on mount
  useEffect(() => {
    try {
      // Try to load driver location from local storage
      const savedDriverLocation = localStorage.getItem('driverLocation');
      if (savedDriverLocation) {
        const parsedLocation = JSON.parse(savedDriverLocation);
        // Validate the data
        if (parsedLocation && 
            typeof parsedLocation.latitude === 'number' && 
            typeof parsedLocation.longitude === 'number') {
          setDriverLocation({
            ...parsedLocation,
            type: 'driver'
          });
        }
      }
      
      // Try to load background tracking setting
      const trackingEnabled = localStorage.getItem('backgroundTrackingEnabled');
      if (trackingEnabled === 'true') {
        setBackgroundTrackingEnabled(true);
      }
    } catch (error) {
      console.error('Error loading map settings from storage:', error);
    }
  }, []);
  
  // Save driver location to local storage when it changes
  useEffect(() => {
    if (driverLocation) {
      try {
        localStorage.setItem('driverLocation', JSON.stringify(driverLocation));
      } catch (error) {
        console.error('Error saving driver location to storage:', error);
      }
    }
  }, [driverLocation]);
  
  // Save background tracking setting when it changes
  useEffect(() => {
    try {
      localStorage.setItem('backgroundTrackingEnabled', isBackgroundTrackingEnabled.toString());
    } catch (error) {
      console.error('Error saving background tracking setting to storage:', error);
    }
  }, [isBackgroundTrackingEnabled]);
  
  return (
    <DeliveryMapContext.Provider 
      value={{
        selectedDeliveryId,
        setSelectedDeliveryId,
        driverLocation,
        updateDriverLocation,
        mapZoom,
        setMapZoom,
        isNativeMap,
        isBackgroundTrackingEnabled,
        setBackgroundTrackingEnabled
      }}
    >
      {children}
    </DeliveryMapContext.Provider>
  );
};

export const useDeliveryMap = () => {
  const context = useContext(DeliveryMapContext);
  if (!context) {
    throw new Error('useDeliveryMap must be used within a DeliveryMapProvider');
  }
  return context;
};
