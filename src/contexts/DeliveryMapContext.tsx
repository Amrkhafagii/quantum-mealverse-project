
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DeliveryMapContextType {
  selectedDeliveryId: string | null;
  setSelectedDeliveryId: (id: string | null) => void;
  mapCenter: { latitude: number; longitude: number } | null;
  setMapCenter: (center: { latitude: number; longitude: number } | null) => void;
  isMapReady: boolean;
  setIsMapReady: (ready: boolean) => void;
}

const DeliveryMapContext = createContext<DeliveryMapContextType | undefined>(undefined);

interface DeliveryMapProviderProps {
  children: ReactNode;
}

export const DeliveryMapProvider: React.FC<DeliveryMapProviderProps> = ({ children }) => {
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const value: DeliveryMapContextType = {
    selectedDeliveryId,
    setSelectedDeliveryId,
    mapCenter,
    setMapCenter,
    isMapReady,
    setIsMapReady
  };

  return (
    <DeliveryMapContext.Provider value={value}>
      {children}
    </DeliveryMapContext.Provider>
  );
};

export const useDeliveryMap = (): DeliveryMapContextType => {
  const context = useContext(DeliveryMapContext);
  if (context === undefined) {
    throw new Error('useDeliveryMap must be used within a DeliveryMapProvider');
  }
  return context;
};
