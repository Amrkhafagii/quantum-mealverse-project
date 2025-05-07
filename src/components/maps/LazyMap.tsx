
import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

// Lazy load the map components
const DeliveryGoogleMap = React.lazy(() => 
  import('./DeliveryGoogleMap')
);

const NativeMap = React.lazy(() => 
  import('./NativeMap')
);

interface LazyMapProps {
  isNative?: boolean;
  onMapReady?: () => void;
  className?: string;
  mapId?: string;
  height?: string;
  [key: string]: any; // For other props to pass through to the map component
}

const LazyMap: React.FC<LazyMapProps> = ({
  isNative = false,
  onMapReady,
  className = '',
  height = 'h-[300px]',
  mapId = 'default-map',
  ...mapProps
}) => {
  const [isInView, setIsInView] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Set up intersection observer to load map only when in viewport
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '200px', // Load a bit before it comes into view
      threshold: 0.01
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      });
    }, options);

    const currentElement = document.getElementById(`map-container-${mapId}`);
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      observer.disconnect();
    };
  }, [mapId]);

  const handleMapLoad = () => {
    setMapLoaded(true);
    if (onMapReady) {
      onMapReady();
    }
  };

  return (
    <Card className={className}>
      <CardContent className={`p-0 ${height} relative`} id={`map-container-${mapId}`}>
        {!isInView ? (
          <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Map loading...</p>
            </div>
          </div>
        ) : (
          <Suspense fallback={
            <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          }>
            {isNative ? (
              <NativeMap
                {...mapProps}
                className="h-full w-full"
                onMapLoad={handleMapLoad}
              />
            ) : (
              <DeliveryGoogleMap
                {...mapProps}
                className="h-full w-full"
                onMapLoad={handleMapLoad}
              />
            )}
          </Suspense>
        )}
        
        {/* Show loading overlay until the map is fully loaded */}
        {isInView && !mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LazyMap;
