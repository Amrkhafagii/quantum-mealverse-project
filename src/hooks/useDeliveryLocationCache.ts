
import { useState, useEffect, useCallback } from 'react';
import { DeliveryLocation } from '@/types/location';
import { LocationFreshness } from '@/types/unifiedLocation';

export function useDeliveryLocationCache() {
  const [cachedLocations, setCachedLocations] = useState<Map<string, DeliveryLocation>>(new Map());
  const [lastUpdated, setLastUpdated] = useState<Map<string, number>>(new Map());

  // Calculate location freshness
  const calculateFreshness = useCallback((timestamp: number): LocationFreshness => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
      return 'fresh';
    } else if (diff < 300000) { // Less than 5 minutes
      return 'moderate';
    } else if (diff < 1800000) { // Less than 30 minutes
      return 'stale';
    } else {
      return 'invalid';
    }
  }, []);

  // Cache a new location
  const cacheLocation = useCallback((id: string, location: DeliveryLocation) => {
    setCachedLocations(prev => {
      const updated = new Map(prev);
      updated.set(id, location);
      return updated;
    });
    
    setLastUpdated(prev => {
      const updated = new Map(prev);
      updated.set(id, Date.now());
      return updated;
    });
  }, []);

  // Get location with freshness
  const getLocation = useCallback((id: string): { location: DeliveryLocation | null, freshness: LocationFreshness } => {
    const location = cachedLocations.get(id) || null;
    const timestamp = lastUpdated.get(id) || 0;
    
    if (!location) {
      return { location: null, freshness: 'invalid' };
    }
    
    return {
      location,
      freshness: calculateFreshness(timestamp)
    };
  }, [cachedLocations, lastUpdated, calculateFreshness]);

  // Clear old locations periodically
  useEffect(() => {
    const clearOldLocations = () => {
      const now = Date.now();
      let hasRemoved = false;
      
      setLastUpdated(prev => {
        const updated = new Map(prev);
        for (const [id, timestamp] of updated.entries()) {
          if (now - timestamp > 3600000) { // Older than 1 hour
            updated.delete(id);
            hasRemoved = true;
          }
        }
        return updated;
      });
      
      if (hasRemoved) {
        setCachedLocations(prev => {
          const updated = new Map(prev);
          for (const id of updated.keys()) {
            if (!lastUpdated.has(id)) {
              updated.delete(id);
            }
          }
          return updated;
        });
      }
    };
    
    const interval = setInterval(clearOldLocations, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return {
    cacheLocation,
    getLocation,
    clearCache: useCallback(() => {
      setCachedLocations(new Map());
      setLastUpdated(new Map());
    }, [])
  };
}
