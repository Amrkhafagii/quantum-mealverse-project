
import { DeliveryLocation, LocationFreshness } from '@/types/location';

export const calculateLocationFreshness = (
  locationTimestamp: number | undefined
): LocationFreshness => {
  if (!locationTimestamp) return 'invalid';
  
  const now = Date.now();
  const ageInMinutes = (now - locationTimestamp) / (1000 * 60);
  
  if (ageInMinutes < 2) return 'fresh';
  if (ageInMinutes < 5) return 'moderate';
  if (ageInMinutes < 15) return 'stale';
  return 'invalid';
};

export const isLocationStale = (locationTimestamp: number | undefined): boolean => {
  if (!locationTimestamp) return true;
  
  const now = Date.now();
  const ageInMinutes = (now - locationTimestamp) / (1000 * 60);
  return ageInMinutes > 2; // Stale after 2 minutes for delivery
};

export const cacheDeliveryLocation = (location: DeliveryLocation): void => {
  try {
    localStorage.setItem('deliveryLocation', JSON.stringify(location));
  } catch (error) {
    console.error('Error caching delivery location:', error);
  }
};

export const getCachedDeliveryLocation = (): DeliveryLocation | null => {
  try {
    const cachedLocationString = localStorage.getItem('deliveryLocation');
    if (cachedLocationString) {
      const cachedLocation = JSON.parse(cachedLocationString);
      if (cachedLocation?.latitude && cachedLocation?.longitude) {
        return cachedLocation;
      }
    }
  } catch (error) {
    console.error('Error reading cached location:', error);
  }
  return null;
};
