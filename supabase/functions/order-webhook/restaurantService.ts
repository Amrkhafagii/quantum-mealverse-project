
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function findNearestRestaurants(
  supabase: SupabaseClient,
  latitude: number,
  longitude: number,
  maxDistance = 50,
  limit = 3
) {
  const { data, error } = await supabase.rpc('find_nearest_restaurant', {
    order_lat: latitude,
    order_lng: longitude,
    max_distance_km: maxDistance
  });

  if (error) {
    console.error('Error finding nearest restaurants:', error);
    return null;
  }

  return data;
}

export async function createRestaurantAssignment(
  supabase: SupabaseClient,
  orderId: string,
  restaurantId: string,
  expiresAt: string
) {
  const { data, error } = await supabase
    .from('restaurant_assignments')
    .insert({
      order_id: orderId,
      restaurant_id: restaurantId,
      status: 'pending',
      expires_at: expiresAt
    })
    .select()
    .single();

  if (error) {
    console.error(`Error creating assignment for order ${orderId} to restaurant ${restaurantId}:`, error);
    return null;
  }

  return data;
}

export async function logAssignmentAttempt(
  supabase: SupabaseClient,
  orderId: string,
  restaurantId: string,
  status: string,
  notes: string | null = null
) {
  const { error } = await supabase
    .from('restaurant_assignment_history')
    .insert({
      order_id: orderId,
      restaurant_id: restaurantId,
      status,
      notes
    });

  if (error) {
    console.error(`Error logging assignment history:`, error);
  }
}
