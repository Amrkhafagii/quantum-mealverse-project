
import { supabase } from "@/integrations/supabase/client";
import { NearbyRestaurantsRow, NearbyRestaurantLocation } from "@/types/nearbyRestaurants";

/**
 * Insert a new nearby_restaurants record for a user and related locations
 */
export async function addNearbyRestaurants(
  userId: string,
  userLatitude: number,
  userLongitude: number,
  locations: Omit<NearbyRestaurantLocation, 'id' | 'nearby_restaurants_id'>[]
): Promise<{ error: any; data: NearbyRestaurantsRow | null }> {
  // Start a transaction by explicit step-by-step
  // 1. Insert the parent nearby_restaurants row
  const { data: parent, error: parentError } = await supabase
    .from('nearby_restaurants')
    .insert({
      user_id: userId,
      user_latitude: userLatitude,
      user_longitude: userLongitude
    })
    .select()
    .single();

  if (parentError || !parent) {
    return { error: parentError, data: null };
  }

  // 2. Insert related locations into the join table (limit to 3)
  const parentId = parent.id;
  const insertLocations = locations.slice(0, 3).map((loc) => ({
    nearby_restaurants_id: parentId,
    restaurant_id: loc.restaurant_id,
    restaurant_latitude: loc.restaurant_latitude,
    restaurant_longitude: loc.restaurant_longitude
  }));

  let locationsData: any[] = [];
  if (insertLocations.length > 0) {
    const { data: locData, error: locError } = await supabase
      .from('nearby_restaurant_locations')
      .insert(insertLocations)
      .select();

    if (locError) {
      return { error: locError, data: null };
    }
    locationsData = locData;
  }

  // Compose the full record for the consumer
  const result: NearbyRestaurantsRow = {
    ...parent,
    locations: locationsData
  };

  return { data: result, error: null };
}

/**
 * Fetch all nearby_restaurants records for a user (latest first, with locations included)
 */
export async function getNearbyRestaurantsForUser(userId: string): Promise<NearbyRestaurantsRow[]> {
  // 1. Get the restaurants for this user latest first
  const { data: rows, error } = await supabase
    .from('nearby_restaurants')
    .select('id, user_id, user_latitude, user_longitude, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !rows) {
    console.error('Error fetching nearby restaurants:', error);
    return [];
  }

  // 2. For each row, fetch the related locations from the join table
  const ids = rows.map((r: any) => r.id);
  if (ids.length === 0) {
    return [];
  }

  const { data: locationsData, error: locationsError } = await supabase
    .from('nearby_restaurant_locations')
    .select('id, nearby_restaurants_id, restaurant_id, restaurant_latitude, restaurant_longitude')
    .in('nearby_restaurants_id', ids);

  // Map locations by nearby_restaurants_id for easy joining
  const locMap: Record<string, NearbyRestaurantLocation[]> = {};
  (locationsData || []).forEach((loc: NearbyRestaurantLocation) => {
    if (!locMap[loc.nearby_restaurants_id]) {
      locMap[loc.nearby_restaurants_id] = [];
    }
    locMap[loc.nearby_restaurants_id].push(loc);
  });

  // Compose rows with their locations
  const output: NearbyRestaurantsRow[] = rows.map((row: any) => ({
    ...row,
    locations: locMap[row.id] || []
  }));

  return output;
}
