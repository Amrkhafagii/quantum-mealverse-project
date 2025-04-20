
import { supabase } from "@/integrations/supabase/client";

// Helper to add location to user_location table (optional, more tracking)
async function addUserLocation(userId: string, latitude: number, longitude: number) {
  await supabase.from('user_locations').insert({
    user_id: userId,
    latitude,
    longitude,
    source: 'login'
  });
}

// Helper to fetch restaurants nearby using Supabase SQL function, picking up to 3 closest
export async function findNearbyRestaurants(latitude: number, longitude: number, maxDistanceKm = 10) {
  // Raw SQL RPC
  const { data, error } = await supabase.rpc('find_nearest_restaurant', {
    order_lat: latitude,
    order_lng: longitude,
    max_distance_km: maxDistanceKm,
  });

  if (error) {
    console.warn('Error while finding nearest restaurants:', error);
    return [];
  }

  // Expecting each row: { restaurant_id, user_id, distance_km }
  // Fetch restaurant details for the ids
  const restaurantIds = (data || []).map((row: any) => row.restaurant_id);
  if (!restaurantIds.length) return [];

  const { data: restaurants, error: restError } = await supabase
    .from('restaurants')
    .select('id, name, latitude, longitude, address, email')
    .in('id', restaurantIds);

  if (restError) {
    console.warn('Error while fetching restaurant details:', restError);
    return [];
  }

  // Return joined restaurant/location
  // Add the distance as well
  return restaurantIds.map((id: string) => {
    const row = (data || []).find((r: any) => r.restaurant_id === id);
    const info = (restaurants || []).find((r: any) => r.id === id);
    return {
      ...info,
      distance_km: row?.distance_km ?? null
    };
  });
}

// Workflow to run after user login: Just insert user location and optionally return nearby restaurants
export async function addNearbyRestaurantForUser(latitude: number, longitude: number) {
  const sessionInfo = await supabase.auth.getSession();
  const userId = sessionInfo.data.session?.user?.id;
  if (!userId) throw new Error("User not authenticated");

  // Insert user location for tracking
  await addUserLocation(userId, latitude, longitude);

  // Optionally, fetch nearby restaurants (return to caller if needed)
  // (You may use findNearbyRestaurants here if you want to show nearby restaurants to user)
  // const nearby = await findNearbyRestaurants(latitude, longitude);
  // return nearby;
}
