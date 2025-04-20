
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function findNearestRestaurants(
  supabase: SupabaseClient,
  latitude: number,
  longitude: number,
  maxDistance = 50
) {
  console.log(`Searching for restaurants near (${latitude}, ${longitude}) within ${maxDistance}km`);
  
  try {
    // Ensure we're explicitly passing double precision parameters
    const { data, error } = await supabase.rpc('find_nearest_restaurant', {
      order_lat: parseFloat(latitude.toString()),
      order_lng: parseFloat(longitude.toString()),
      max_distance_km: parseFloat(maxDistance.toString())
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

export async function createRestaurantAssignment(
  supabase: SupabaseClient,
  orderId: string,
  restaurantId: string,
  expiresAt: string
) {
  console.log(`Creating restaurant assignment for order ${orderId} to restaurant ${restaurantId}`);

  try {
    const { data, error } = await supabase
      .from('restaurant_assignments')
      .insert({
        order_id: orderId,
        restaurant_id: restaurantId,
        expires_at: expiresAt,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating restaurant assignment:', error);
      return null;
    }

    console.log('Created restaurant assignment:', data);
    return data;
  } catch (e) {
    console.error('Unexpected error in createRestaurantAssignment:', e);
    return null;
  }
}

export async function logAssignmentAttempt(
  supabase: SupabaseClient,
  orderId: string,
  restaurantId: string,
  status: string,
  notes?: string
) {
  console.log(`Logging assignment attempt for order ${orderId} to restaurant ${restaurantId}`);

  try {
    const { data, error } = await supabase
      .from('restaurant_assignment_history')
      .insert({
        order_id: orderId,
        restaurant_id: restaurantId,
        status,
        notes
      });

    if (error) {
      console.error('Error logging assignment attempt:', error);
      return null;
    }

    return true;
  } catch (e) {
    console.error('Unexpected error in logAssignmentAttempt:', e);
    return null;
  }
}
