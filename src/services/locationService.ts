
import { supabase } from '@/integrations/supabase/client';

export type UserType = 'customer' | 'restaurant' | 'delivery';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp?: string;
  source?: string;
}

export const saveUserLocation = async (userId: string, locationData: LocationData) => {
  try {
    const { error } = await supabase
      .from('user_locations')
      .insert({
        user_locations_user_id: userId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timestamp: locationData.timestamp || new Date().toISOString(),
        source: locationData.source || 'gps'
      });

    if (error) {
      console.error('Error saving user location:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in saveUserLocation:', error);
    return { success: false, error: 'Failed to save location' };
  }
};

export const getUserLocations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_locations_user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching user locations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserLocations:', error);
    return [];
  }
};

export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    });
  });
};

export const LocationService = {
  async requestLocationAndUpdate(userType: UserType, userId: string) {
    const position = await getCurrentLocation();
    const locationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      source: 'gps' as const
    };
    
    await saveUserLocation(userId, locationData);
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  }
};
