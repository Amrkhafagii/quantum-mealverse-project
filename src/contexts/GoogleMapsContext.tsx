
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getConfigValue } from '@/services/configService';
import { toast } from '@/components/ui/use-toast';

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
  isLoading: boolean;
  updateDriverLocation?: (location: MapLocation) => void;
};

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  googleMapsApiKey: '',
  setGoogleMapsApiKey: () => {},
  isLoaded: false,
  isLoading: true,
  updateDriverLocation: undefined,
});

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  // State for API key and loading status
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // This function will be available globally to update the driver's location
  const updateDriverLocation = (location: MapLocation) => {
    // In the future, this could be expanded to store the driver location in a global state
    console.log('Driver location updated:', location);
    // Implementation logic would go here if needed
  };

  // Fetch the API key from the database on mount
  useEffect(() => {
    const fetchApiKey = async () => {
      setIsLoading(true);
      try {
        // Try to get the API key from the database
        const dbApiKey = await getConfigValue('google_maps_api_key');
        
        if (dbApiKey) {
          setGoogleMapsApiKey(dbApiKey);
          localStorage.setItem('googleMapsApiKey', dbApiKey); // Also cache in localStorage as fallback
          setIsLoaded(true);
          console.log('Loaded Google Maps API key from database');
        } else {
          // Fall back to localStorage or environment variable
          const localKey = localStorage.getItem('googleMapsApiKey');
          const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          
          if (localKey) {
            setGoogleMapsApiKey(localKey);
            setIsLoaded(true);
            console.log('Loaded Google Maps API key from localStorage');
          } else if (envKey) {
            setGoogleMapsApiKey(envKey);
            localStorage.setItem('googleMapsApiKey', envKey);
            setIsLoaded(true);
            console.log('Loaded Google Maps API key from environment');
          } else {
            setIsLoaded(false);
            console.warn('No Google Maps API key found');
          }
        }
      } catch (error) {
        console.error('Error loading Google Maps API key:', error);
        // Fall back to localStorage or environment variable
        const localKey = localStorage.getItem('googleMapsApiKey');
        const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (localKey || envKey) {
          setGoogleMapsApiKey(localKey || envKey || '');
          setIsLoaded(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  // Update localStorage and loaded status when API key changes
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
        isLoading,
        updateDriverLocation,
      }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);
