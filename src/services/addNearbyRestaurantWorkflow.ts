
import { supabase } from "@/integrations/supabase/client";
import { addNearbyRestaurants } from "@/services/nearbyRestaurantsService";

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
async function findNearbyRestaurants(latitude: number, longitude: number, maxDistanceKm = 10) {
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

  // Expecting each row: { restaurant_id, restaurant_name, restaurant_address, restaurant_email, distance_km }
  return (data || []).slice(0, 3).map((row: any) => ({
    restaurant_id: row.restaurant_id,
    restaurant_latitude: null,  // We'll fetch separately, but not needed for join
    restaurant_longitude: null,
  }));
}

// Workflow to run after user login
export async function addNearbyRestaurantForUser(latitude: number, longitude: number) {
  const sessionInfo = await supabase.auth.getSession();
  const userId = sessionInfo.data.session?.user?.id;
  if (!userId) throw new Error("User not authenticated");

  // Optional: insert user location for tracking
  await addUserLocation(userId, latitude, longitude);

  // Get close restaurants for this location
  const locations = await findNearbyRestaurants(latitude, longitude);

  // For each location, fill in the restaurant lat/lng
  // If you want actual lat/lng per restaurant, fetch those now
  for (let loc of locations) {
    if (!loc.restaurant_latitude || !loc.restaurant_longitude) {
      const { data: rest } = await supabase
        .from('restaurants')
        .select('latitude,longitude')
        .eq('id', loc.restaurant_id)
        .maybeSingle();
      if (rest) {
        loc.restaurant_latitude = rest.latitude;
        loc.restaurant_longitude = rest.longitude;
      }
    }
  }

  // Add parent and child records
  await addNearbyRestaurants(
    userId,
    latitude,
    longitude,
    locations
  );
}
