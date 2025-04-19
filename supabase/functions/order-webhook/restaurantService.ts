
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function findNearestRestaurants(
  supabase: SupabaseClient,
  latitude: number,
  longitude: number,
  maxDistance = 50
) {
  console.log(`Searching for restaurants near (${latitude}, ${longitude}) within ${maxDistance}km`);
  
  try {
    const { data, error } = await supabase.rpc('find_nearest_restaurant', {
      order_lat: latitude,
      order_lng: longitude,
      max_distance_km: maxDistance
    });

    if (error) {
      console.error('Error finding nearest restaurants:', error);
      return [];
    }

    console.log('Nearest restaurants:', data);
    return data || [];
  } catch (e) {
    console.error('Unexpected error in findNearestRestaurants:', e);
    return [];
  }
}
