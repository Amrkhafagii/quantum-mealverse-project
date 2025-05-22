import { useState, useEffect } from 'react';
import { DeliveryLocation, LocationFreshness } from '@/types/location';

// Simple cache helper for delivery locations
export const useDeliveryLocationCache = () => {
  const [cachedLocations, setCachedLocations] = useState<
    Map<string, { location: DeliveryLocation; timestamp: number }>
  >(new Map());

  // Add a location to the cache
  const cacheLocation = (id: string, location: DeliveryLocation) => {
    setCachedLocations((prev) => {
      const newMap = new Map(prev);
      newMap.set(id, { location, timestamp: Date.now() });
      return newMap;
    });
  };

  // Get a location from the cache
  const getCachedLocation = (id: string): DeliveryLocation | null => {
    const cached = cachedLocations.get(id);
    return cached ? cached.location : null;
  };

  // Get the freshness of a cached location
  const getCacheFreshness = (id: string): LocationFreshness => {
    const cached = cachedLocations.get(id);
    if (!cached) return 'expired';

    const now = Date.now();
    const age = now - cached.timestamp;

    if (age < 60 * 1000) return 'fresh'; // Less than 1 minute
    if (age < 5 * 60 * 1000) return 'recent'; // Less than 5 minutes
    if (age < 30 * 60 * 1000) return 'stale'; // Less than 30 minutes
    return 'expired';
  };

  // Remove expired locations from the cache
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setCachedLocations((prev) => {
        const now = Date.now();
        const newMap = new Map();
        
        // Only keep locations that are less than 1 hour old
        prev.forEach((value, key) => {
          if (now - value.timestamp < 60 * 60 * 1000) {
            newMap.set(key, value);
          }
        });
        
        return newMap;
      });
    }, 10 * 60 * 1000); // Clean up every 10 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    cacheLocation,
    getCachedLocation,
    getCacheFreshness
  };
};
