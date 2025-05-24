
import React, { lazy, Suspense } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Skeleton } from '@/components/ui/skeleton';

// Lazily load Google Maps script component
const GoogleMapsScript = lazy(() => 
  import('@react-google-maps/api').then(module => ({
    default: module.LoadScript
  }))
);

interface LazyGoogleMapsLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * LazyGoogleMapsLoader - Google-recommended pattern for lazy loading Google Maps
 * 
 * This component follows Google's recommended practices for lazy loading the Maps API:
 * 1. Only load when component is mounted (lazy)
 * 2. Provide clear loading states
 * 3. Handle errors gracefully
 * 4. Avoid multiple script loads
 */
export const LazyGoogleMapsLoader: React.FC<LazyGoogleMapsLoaderProps> = ({
  children,
  fallback,
  onLoad,
  onError
}) => {
  const { googleMapsApiKey, isLoaded } = useGoogleMaps();

  // If Maps API is already loaded through the context, no need to load script again
  if (isLoaded) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={fallback || <Skeleton className="w-full h-full min-h-[200px]" />}>
      {googleMapsApiKey ? (
        <GoogleMapsScript
          googleMapsApiKey={googleMapsApiKey}
          onLoad={onLoad}
          onError={onError}
          loadingElement={fallback || <Skeleton className="w-full h-full min-h-[200px]" />}
        >
          {children}
        </GoogleMapsScript>
      ) : (
        // Return children even if API key missing - the parent components should handle this case
        <>{children}</>
      )}
    </Suspense>
  );
};

export default LazyGoogleMapsLoader;
