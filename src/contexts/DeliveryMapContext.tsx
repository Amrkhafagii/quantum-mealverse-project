
import React, { createContext, useState, useContext, useCallback } from 'react';
import { useGoogleMaps } from './GoogleMapsContext';

interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: 'driver' | 'restaurant' | 'customer' | 'generic';
}

interface DeliveryMapContextType {
  driverLocation: MapLocation | null;
  updateDriverLocation: (location: MapLocation) => void;
  restaurantLocation: MapLocation | null;
  setRestaurantLocation: (location: MapLocation | null) => void;
  customerLocation: MapLocation | null;
  setCustomerLocation: (location: MapLocation | null) => void;
  additionalLocations: MapLocation[];
  addLocation: (location: MapLocation) => void;
  removeLocation: (index: number) => void;
  clearLocations: () => void;
  showDriverRoute: boolean;
  setShowDriverRoute: (show: boolean) => void;
  selectedDeliveryId: string | null;
  setSelectedDeliveryId: (id: string | null) => void;
  locationUpdateTimestamp: Date | null;
  updateLocationTimestamp: () => void;
}

const DeliveryMapContext = createContext<DeliveryMapContextType | undefined>(undefined);

export const DeliveryMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateDriverLocation: updateGlobalDriverLocation } = useGoogleMaps();
  const [driverLocation, setDriverLocation] = useState<MapLocation | null>(null);
  const [restaurantLocation, setRestaurantLocation] = useState<MapLocation | null>(null);
  const [customerLocation, setCustomerLocation] = useState<MapLocation | null>(null);
  const [additionalLocations, setAdditionalLocations] = useState<MapLocation[]>([]);
  const [showDriverRoute, setShowDriverRoute] = useState<boolean>(true);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [locationUpdateTimestamp, setLocationUpdateTimestamp] = useState<Date | null>(null);

  const updateDriverLocation = useCallback((location: MapLocation) => {
    setDriverLocation({
      ...location,
      type: 'driver',
      title: location.title || 'Driver Location'
    });
    
    // Also update the global driver location
    updateGlobalDriverLocation(location);
    
    // Update timestamp
    setLocationUpdateTimestamp(new Date());
  }, [updateGlobalDriverLocation]);

  const updateLocationTimestamp = useCallback(() => {
    setLocationUpdateTimestamp(new Date());
  }, []);

  const addLocation = useCallback((location: MapLocation) => {
    setAdditionalLocations(prev => [...prev, location]);
  }, []);

  const removeLocation = useCallback((index: number) => {
    setAdditionalLocations(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearLocations = useCallback(() => {
    setAdditionalLocations([]);
  }, []);

  return (
    <DeliveryMapContext.Provider
      value={{
        driverLocation,
        updateDriverLocation,
        restaurantLocation,
        setRestaurantLocation,
        customerLocation,
        setCustomerLocation,
        additionalLocations,
        addLocation,
        removeLocation,
        clearLocations,
        showDriverRoute,
        setShowDriverRoute,
        selectedDeliveryId,
        setSelectedDeliveryId,
        locationUpdateTimestamp,
        updateLocationTimestamp,
      }}
    >
      {children}
    </DeliveryMapContext.Provider>
  );
};

export const useDeliveryMap = () => {
  const context = useContext(DeliveryMapContext);
  if (context === undefined) {
    throw new Error('useDeliveryMap must be used within a DeliveryMapProvider');
  }
  return context;
};
