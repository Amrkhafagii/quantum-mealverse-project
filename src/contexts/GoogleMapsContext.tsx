
import React, { createContext, useState, useContext, useEffect } from 'react';

interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: 'driver' | 'restaurant' | 'customer' | 'generic';
}

interface GoogleMapsContextType {
  googleMapsApiKey: string | null;
  setGoogleMapsApiKey: (apiKey: string) => void;
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

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with the provided API key
  const [googleMapsApiKey, setGoogleMapsApiKeyState] = useState<string | null>('AIzaSyBKQztvlSSaT-kjpzWBHIZ1uzgRh8rPlVs');
  const [driverLocation, setDriverLocation] = useState<MapLocation | null>(null);
  const [restaurantLocation, setRestaurantLocation] = useState<MapLocation | null>(null);
  const [customerLocation, setCustomerLocation] = useState<MapLocation | null>(null);
  const [additionalLocations, setAdditionalLocations] = useState<MapLocation[]>([]);

  // Load API key from localStorage or environment variable on first render
  useEffect(() => {
    const storedApiKey = localStorage.getItem('google_maps_api_key');
    if (storedApiKey) {
      setGoogleMapsApiKeyState(storedApiKey);
    } else if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      setGoogleMapsApiKeyState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    } else {
      // Store the provided API key if none is found
      localStorage.setItem('google_maps_api_key', 'AIzaSyBKQztvlSSaT-kjpzWBHIZ1uzgRh8rPlVs');
    }
  }, []);

  const setGoogleMapsApiKey = (apiKey: string) => {
    setGoogleMapsApiKeyState(apiKey);
    localStorage.setItem('google_maps_api_key', apiKey);
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
    <GoogleMapsContext.Provider
      value={{
        googleMapsApiKey,
        setGoogleMapsApiKey,
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
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};
