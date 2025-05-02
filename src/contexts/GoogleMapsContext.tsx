
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type GoogleMapsContextType = {
  googleMapsApiKey: string;
  setGoogleMapsApiKey: (key: string) => void;
  isLoaded: boolean;
};

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  googleMapsApiKey: '',
  setGoogleMapsApiKey: () => {},
  isLoaded: false,
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
      }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);
