
import React, { useEffect, useState, useRef } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

// This is the component that centrally manages Google Maps API loading
interface GoogleMapFactoryProps {
  render: (isLoaded: boolean) => React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  onLoaded?: () => void;
  onError?: (error: Error) => void;
}

/**
 * GoogleMapFactory - Standardized component for managing Google Maps API loading
 * 
 * This component centralizes API key checking, loading states, and error handling
 * for all Google Maps components.
 */
export const GoogleMapFactory: React.FC<GoogleMapFactoryProps> = ({
  render,
  fallback,
  errorFallback,
  loadingFallback,
  onLoaded,
  onError,
}) => {
  const { googleMapsApiKey, isLoaded, isLoading, error } = useGoogleMaps();
  const [loadingError, setLoadingError] = useState<Error | null>(null);
  const hasCalledOnLoaded = useRef(false);
  
  useEffect(() => {
    if (isLoaded && !hasCalledOnLoaded.current && onLoaded) {
      onLoaded();
      hasCalledOnLoaded.current = true;
    }
  }, [isLoaded, onLoaded]);
  
  useEffect(() => {
    if (error && onError) {
      onError(error);
      setLoadingError(error);
    }
  }, [error, onError]);
  
  // No API key case
  if (!googleMapsApiKey) {
    return (
      fallback || (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing API Key</AlertTitle>
          <AlertDescription>
            Google Maps API key is required. Please set up your API key in the settings.
          </AlertDescription>
        </Alert>
      )
    );
  }
  
  // Error case
  if (loadingError || error) {
    return (
      errorFallback || (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Map Loading Error</AlertTitle>
          <AlertDescription>
            {loadingError?.message || error?.message || "Failed to load Google Maps"}
          </AlertDescription>
        </Alert>
      )
    );
  }
  
  // Loading case
  if (isLoading) {
    return loadingFallback || <Skeleton className="w-full h-full min-h-[200px]" />;
  }
  
  // Render when loaded
  return <>{render(isLoaded)}</>;
};

export default GoogleMapFactory;
