
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
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with cached location if available
  useEffect(() => {
    const fetchCachedLocation = async () => {
      setIsLoading(true);
      try {
        const cachedLocation = await getCachedDeliveryLocation();
        
        if (cachedLocation) {
          setCachedLocation(cachedLocation);
          
          if (cachedLocation.timestamp) {
            const timestamp = typeof cachedLocation.timestamp === 'number' 
              ? new Date(cachedLocation.timestamp).toISOString()
              : new Date(cachedLocation.timestamp).toISOString();
              
            const freshness = calculateLocationFreshness(timestamp);
            setCachedLocationFreshness(freshness);
            setIsStale(isLocationStale(timestamp));
            setLastUpdated(new Date(cachedLocation.timestamp));
          }
        }
      } catch (error) {
        console.error("Error fetching cached location:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCachedLocation();
  }, []);

  // Calculate freshness based on age whenever checking state
  useEffect(() => {
    if (!cachedLocation?.timestamp) return;
    
    const checkFreshness = () => {
      const timestamp = typeof cachedLocation.timestamp === 'number'
        ? new Date(cachedLocation.timestamp).toISOString()
        : new Date(cachedLocation.timestamp).toISOString();
        
      const freshness = calculateLocationFreshness(timestamp);
      setCachedLocationFreshness(freshness);
      setIsStale(isLocationStale(timestamp));
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
    lastUpdated,
    isLoading
  };
};
