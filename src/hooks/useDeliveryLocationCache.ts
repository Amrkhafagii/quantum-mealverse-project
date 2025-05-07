
import { useState, useEffect } from 'react';
import { DeliveryLocation, LocationFreshness } from '@/types/location';
import { 
  getCachedDeliveryLocation, 
  calculateLocationFreshness, 
  isLocationStale 
} from '@/utils/locationUtils';

export const useDeliveryLocationCache = () => {
  const [cachedLocation, setCachedLocation] = useState<DeliveryLocation | null>(null);
  const [cachedLocationFreshness, setCachedLocationFreshness] = useState<LocationFreshness>('invalid');
  const [isStale, setIsStale] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Initialize with cached location if available
  useEffect(() => {
    const cachedLocation = getCachedDeliveryLocation();
    
    if (cachedLocation) {
      setCachedLocation(cachedLocation);
      
      if (cachedLocation.timestamp) {
        const freshness = calculateLocationFreshness(new Date(cachedLocation.timestamp).toISOString());
        setCachedLocationFreshness(freshness);
        setIsStale(isLocationStale(new Date(cachedLocation.timestamp).toISOString()));
        setLastUpdated(new Date(cachedLocation.timestamp));
      }
    }
  }, []);

  // Calculate freshness based on age whenever checking state
  useEffect(() => {
    if (!cachedLocation?.timestamp) return;
    
    const checkFreshness = () => {
      const freshness = calculateLocationFreshness(new Date(cachedLocation.timestamp).toISOString());
      setCachedLocationFreshness(freshness);
      setIsStale(isLocationStale(new Date(cachedLocation.timestamp).toISOString()));
    };
    
    // Check immediately and then every minute
    checkFreshness();
    const interval = setInterval(checkFreshness, 60000);
    return () => clearInterval(interval);
  }, [cachedLocation?.timestamp]);

  return {
    cachedLocation,
    cachedLocationFreshness,
    isStale,
    lastUpdated
  };
};
