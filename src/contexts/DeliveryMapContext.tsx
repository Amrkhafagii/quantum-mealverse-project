
import React, { createContext, useState, useContext, useCallback } from 'react';

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
}

const DeliveryMapContext = createContext<DeliveryMapContextType | null>(null);

export const DeliveryMapProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(14);
  
  const updateDriverLocation = useCallback((location: DriverLocation) => {
    setDriverLocation(location);
  }, []);
  
  return (
    <DeliveryMapContext.Provider 
      value={{
        selectedDeliveryId,
        setSelectedDeliveryId,
        driverLocation,
        updateDriverLocation,
        mapZoom,
        setMapZoom
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
