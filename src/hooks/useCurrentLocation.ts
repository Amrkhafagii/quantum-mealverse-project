
import { useState, useCallback } from 'react';
import { DeliveryLocation } from '@/types/location';
import { toast } from 'sonner';
import { UnifiedLocation, LocationSource } from '@/types/unifiedLocation';
import { Platform } from '@/utils/platform';
import { getDeviceInfo } from '@/utils/deviceInfoUtils';
import { getNetworkInfo } from '@/utils/networkInfoUtils';
import { getBrowserLocation } from '@/utils/webGeolocation';
import { getCapacitorLocation } from '@/utils/capacitorGeolocation';

export function useCurrentLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<DeliveryLocation | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource>('gps');

  const getCurrentLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('useCurrentLocation: Getting current location');
      
      // Try to get device and network info for enhanced context
      const [deviceInfo, networkInfo] = await Promise.all([
        getDeviceInfo(),
        getNetworkInfo()
      ]);
      
      // Special handling for web environment - use browser API directly
      if (Platform.isWeb()) {
        console.log('useCurrentLocation: Using browser geolocation API');
        const browserLocation = await getBrowserLocation();
        if (browserLocation) {
          setLocationSource(browserLocation.source || 'gps');
          setLastLocation(browserLocation);
          setIsLoading(false);
          return browserLocation;
        }
        
        setIsLoading(false);
        return null;
      }
      
      // Use Capacitor implementation for native platforms
      const capacitorLocation = await getCapacitorLocation();
      if (capacitorLocation) {
        setLocationSource(capacitorLocation.source || 'gps');
        setLastLocation(capacitorLocation);
        setIsLoading(false);
        return capacitorLocation;
      }
      
      const errorMessage = 'Failed to get location from any source';
      setError(errorMessage);
      toast.error('Location error', { description: errorMessage });
      setIsLoading(false);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      console.error('Error getting current location', err);
      setError(errorMessage);
      toast.error('Location error', { description: errorMessage });
      setIsLoading(false);
      return null;
    }
  }, []);

  return {
    getCurrentLocation,
    isLoadingLocation: isLoading,
    locationError: error,
    lastLocation,
    locationSource
  };
}
