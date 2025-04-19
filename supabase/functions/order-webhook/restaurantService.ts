import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function findNearestRestaurants(
  supabase: SupabaseClient,
  latitude: number,
  longitude: number,
  maxDistance = 50,
  limit = 3
) {
  console.log(`Searching for restaurants near (${latitude}, ${longitude}) within ${maxDistance}km`);
  
  // First, let's check if there are any restaurants in the database
  const { data: allRestaurants, error: checkError } = await supabase
    .from('restaurants')
    .select('id, name, latitude, longitude, is_active')
    .eq('is_active', true)
    .limit(10);
    
  if (checkError) {
    console.error('Error checking restaurants table:', checkError);
  } else {
    console.log(`Found ${allRestaurants?.length || 0} active restaurants in total`);
    if (allRestaurants && allRestaurants.length > 0) {
      allRestaurants.forEach(r => {
        console.log(`Restaurant: ${r.name}, ID: ${r.id}, Active: ${r.is_active}, Location: (${r.latitude}, ${r.longitude})`);
      });
    }
  }
  
  // Now let's use rpc to find nearest restaurant using only 3 parameters
  try {
    console.log('Calling find_nearest_restaurant RPC function with params:', {
      order_lat: latitude,
      order_lng: longitude,
      max_distance_km: maxDistance
    });
    
    const { data, error } = await supabase.rpc('find_nearest_restaurant', {
      order_lat: latitude,
      order_lng: longitude,
      max_distance_km: maxDistance
    });

    if (error) {
      console.error('Error finding nearest restaurants:', error);
      return [];
    }

    // Log the restaurant data to help with debugging
    console.log('Found nearby restaurants:', data);
    
    if (!data || data.length === 0) {
      console.log(`No restaurants found within ${maxDistance}km of (${latitude}, ${longitude})`);
      
      // If no restaurants found, try a broader search without distance limit
      const { data: broadSearch, error: broadSearchError } = await supabase
        .from('restaurants')
        .select('id as restaurant_id, user_id, name')
        .eq('is_active', true)
        .limit(5);
      
      if (broadSearchError) {
        console.error('Error in broad search:', broadSearchError);
      } else {
        console.log('Closest restaurants (without distance limit):', broadSearch);
      }
    }
    
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
