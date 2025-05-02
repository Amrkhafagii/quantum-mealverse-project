
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: string;
}

type GoogleMapsContextType = {
  googleMapsApiKey: string;
  setGoogleMapsApiKey: (key: string) => void;
  isLoaded: boolean;
  updateDriverLocation?: (location: MapLocation) => void;
};

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  googleMapsApiKey: '',
  setGoogleMapsApiKey: () => {},
  isLoaded: false,
  updateDriverLocation: undefined,
});

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  // Try to get API key from environment or localStorage
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>(
    () => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('googleMapsApiKey') || ''
  );
  
  const [isLoaded, setIsLoaded] = useState<boolean>(!!googleMapsApiKey);

  // This function will be available globally to update the driver's location
  const updateDriverLocation = (location: MapLocation) => {
    // In the future, this could be expanded to store the driver location in a global state
    console.log('Driver location updated:', location);
    // Implementation logic would go here if needed
  };

  useEffect(() => {
    if (googleMapsApiKey) {
      localStorage.setItem('googleMapsApiKey', googleMapsApiKey);
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [googleMapsApiKey]);

  return (
    <GoogleMapsContext.Provider
      value={{
        googleMapsApiKey,
        setGoogleMapsApiKey,
        isLoaded,
        updateDriverLocation,
      }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);
