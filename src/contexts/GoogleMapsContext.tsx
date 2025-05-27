
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: string | null;
  apiKey: string;
  // Additional properties expected by existing components
  googleMapsApiKey: string;
  keySource: 'database' | 'localStorage' | 'environment' | 'default' | 'none';
  isLoading: boolean;
  error: Error | null;
  clearApiKey: () => Promise<void>;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the hardcoded API key
  const apiKey = "AIzaSyBKQztvlSSaT-kjpzWBHIZ1uzgRh8rPlVs";

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google Maps API loaded successfully');
      setIsLoaded(true);
      setIsLoading(false);
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setLoadError('Failed to load Google Maps API');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey]);

  const clearApiKey = async () => {
    // Since we're using a hardcoded key, this is a no-op
    console.log('clearApiKey called - using hardcoded key, no action needed');
  };

  const value: GoogleMapsContextType = {
    isLoaded,
    loadError,
    apiKey,
    // Provide the same value for both property names for compatibility
    googleMapsApiKey: apiKey,
    keySource: 'default', // Since we're using a hardcoded key
    isLoading,
    error: loadError ? new Error(loadError) : null,
    clearApiKey
  };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = (): GoogleMapsContextType => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};
