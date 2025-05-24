
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { googleMapsKeyManager } from '@/services/maps/GoogleMapsKeyManager';
import { toast } from '@/hooks/use-toast';
import { useNetworkRetry } from '@/hooks/useNetworkRetry';

interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: string;
}

type GoogleMapsContextType = {
  googleMapsApiKey: string;
  setGoogleMapsApiKey: (key: string) => Promise<boolean>;
  validateApiKey: (key: string) => Promise<boolean>;
  keySource: 'database' | 'localStorage' | 'environment' | 'default' | 'none';
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  clearApiKey: () => Promise<void>;
  updateDriverLocation?: (location: MapLocation) => void;
};

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  googleMapsApiKey: '',
  setGoogleMapsApiKey: async () => false,
  validateApiKey: async () => false,
  keySource: 'none',
  isLoaded: false,
  isLoading: true,
  error: null,
  clearApiKey: async () => {},
  updateDriverLocation: undefined,
});

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  // State for API key and loading status
  const [googleMapsApiKey, setApiKey] = useState<string>('');
  const [keySource, setKeySource] = useState<'database' | 'localStorage' | 'environment' | 'default' | 'none'>('none');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Use network retry for loading the API key
  const { execute: loadApiKey, isRetrying } = useNetworkRetry(async () => {
    const keyInfo = await googleMapsKeyManager.loadApiKey();
    setApiKey(keyInfo.key);
    setKeySource(keyInfo.source);
    setIsLoaded(!!keyInfo.key);
    return keyInfo;
  });

  // This function will be available globally to update the driver's location
  const updateDriverLocation = (location: MapLocation) => {
    // In the future, this could be expanded to store the driver location in a global state
    console.log('Driver location updated:', location);
  };

  // Set a new API key
  const setGoogleMapsApiKey = useCallback(async (newKey: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      return true; // Always return true as we're using hardcoded key
    } catch (error) {
      console.error('Error setting Google Maps API key:', error);
      setError(error instanceof Error ? error : new Error('Failed to set API key'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Validate an API key
  const validateApiKey = useCallback(async (key: string): Promise<boolean> => {
    return true; // Always return true as we're using hardcoded key
  }, []);
  
  // Clear the API key
  const clearApiKey = useCallback(async (): Promise<void> => {
    // This is a no-op as we're using the hardcoded key
  }, []);

  // Load API key on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await loadApiKey();
      } catch (error) {
        console.error('Error loading Google Maps API key:', error);
        setError(error instanceof Error ? error : new Error('Failed to load API key'));
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [loadApiKey]);

  return (
    <GoogleMapsContext.Provider
      value={{
        googleMapsApiKey,
        setGoogleMapsApiKey,
        validateApiKey,
        keySource,
        isLoaded,
        isLoading,
        error,
        clearApiKey,
        updateDriverLocation,
      }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);
