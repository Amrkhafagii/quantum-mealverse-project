
import React, { createContext, useState, useContext, useEffect } from 'react';

interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: 'driver' | 'restaurant' | 'customer' | 'generic';
}

interface DeliveryMapContextType {
  mapboxToken: string | null;
  setMapboxToken: (token: string) => void;
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
}

const DeliveryMapContext = createContext<DeliveryMapContextType | undefined>(undefined);

export const DeliveryMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mapboxToken, setMapboxTokenState] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<MapLocation | null>(null);
  const [restaurantLocation, setRestaurantLocation] = useState<MapLocation | null>(null);
  const [customerLocation, setCustomerLocation] = useState<MapLocation | null>(null);
  const [additionalLocations, setAdditionalLocations] = useState<MapLocation[]>([]);

  // Load token from localStorage or environment variable on first render
  useEffect(() => {
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      setMapboxTokenState(storedToken);
    } else if (import.meta.env.VITE_MAPBOX_TOKEN) {
      setMapboxTokenState(import.meta.env.VITE_MAPBOX_TOKEN);
    }
  }, []);

  const setMapboxToken = (token: string) => {
    setMapboxTokenState(token);
    localStorage.setItem('mapbox_token', token);
  };

  const updateDriverLocation = (location: MapLocation) => {
    setDriverLocation({
      ...location,
      type: 'driver',
      title: location.title || 'Driver Location'
    });
  };

  const addLocation = (location: MapLocation) => {
    setAdditionalLocations([...additionalLocations, location]);
  };

  const removeLocation = (index: number) => {
    setAdditionalLocations(additionalLocations.filter((_, i) => i !== index));
  };

  const clearLocations = () => {
    setAdditionalLocations([]);
  };

  return (
    <DeliveryMapContext.Provider
      value={{
        mapboxToken,
        setMapboxToken,
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
