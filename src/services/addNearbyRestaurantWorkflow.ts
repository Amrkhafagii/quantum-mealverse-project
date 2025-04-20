
import { supabase } from "@/integrations/supabase/client";

// Helper to add location to user_location table and return inserted row id
async function addUserLocation(userId: string, latitude: number, longitude: number) {
  const { data, error } = await supabase
    .from('user_locations')
    .insert({
      user_id: userId,
      latitude,
      longitude,
      source: 'login'
    })
    .select('id') // Return the inserted row's id
    .single();

  if (error) {
    throw new Error("Failed to insert user location: " + error.message);
  }
  return data?.id;
}

// Helper to fetch restaurants nearby using Supabase SQL function
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

  // Each row: { restaurant_id, restaurant_name, restaurant_address, restaurant_email, distance_km }
  return (data || []).map((row: any) => ({
    restaurant_id: row.restaurant_id,
    restaurant_name: row.restaurant_name,
    restaurant_email: row.restaurant_email,
    restaurant_address: row.restaurant_address,
    distance_km: row.distance_km,
  }));
}

// Workflow to run after user login
export async function addNearbyRestaurantForUser(latitude: number, longitude: number) {
  const sessionInfo = await supabase.auth.getSession();
  const userId = sessionInfo.data.session?.user?.id;
  if (!userId) throw new Error("User not authenticated");

  // 1. Insert user location & get the new user location id
  const userLocationId = await addUserLocation(userId, latitude, longitude);
  if (!userLocationId) throw new Error("Could not create user location!");

  // 2. Find nearby restaurants
  const nearbyRestaurants = await findNearbyRestaurants(latitude, longitude);

  if (!nearbyRestaurants.length) {
    // No nearby, nothing else to do
    return;
  }

  // 3. For each nearby restaurant, get lat/lng and insert into nearby_restaurant_locations
  for (const r of nearbyRestaurants) {
    const { data: details, error } = await supabase
      .from('restaurants')
      .select('latitude,longitude')
      .eq('id', r.restaurant_id)
      .single();
    if (error || !details) continue; // skip this one if error

    await supabase
      .from('nearby_restaurant_locations')
      .insert({
        nearby_restaurants_id: userLocationId,
        restaurant_id: r.restaurant_id,
        restaurant_latitude: details.latitude,
        restaurant_longitude: details.longitude
      });
  }

  // Done!
}

