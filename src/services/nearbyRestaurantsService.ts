
import { supabase } from "@/integrations/supabase/client";
import { NearbyRestaurantsRow, NearbyRestaurantLocation } from "@/types/nearbyRestaurants";

/**
 * Insert a new nearby_restaurants record for a user
 */
export async function addNearbyRestaurants(
  userId: string,
  userLatitude: number,
  userLongitude: number,
  nearby: NearbyRestaurantLocation[]
): Promise<{ error: any; data: NearbyRestaurantsRow | null }> {
  const { data, error } = await supabase
    .from('nearby_restaurants')
    .insert({
      user_id: userId,
      user_latitude: userLatitude,
      user_longitude: userLongitude,
      nearby: nearby.slice(0, 3) // ensure max 3 locations
    })
    .select()
    .single();

  return { data: data as NearbyRestaurantsRow | null, error };
}

/**
 * Fetch all nearby_restaurants records for a user (latest first)
 */
export async function getNearbyRestaurantsForUser(userId: string): Promise<NearbyRestaurantsRow[]> {
  const { data, error } = await supabase
    .from('nearby_restaurants')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching nearby restaurants:', error);
    return [];
  }

  // Type assertion because Supabase JSON will parse nearby into object[] automatically
  return data as NearbyRestaurantsRow[];
}
