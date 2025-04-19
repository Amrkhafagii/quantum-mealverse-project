
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
    .select('id, name, location, is_active')
    .eq('is_active', true)
    .limit(10);
    
  if (checkError) {
    console.error('Error checking restaurants table:', checkError);
  } else {
    console.log(`Found ${allRestaurants?.length || 0} active restaurants in total`);
    if (allRestaurants && allRestaurants.length > 0) {
      allRestaurants.forEach(r => {
        console.log(`Restaurant: ${r.name}, ID: ${r.id}, Active: ${r.is_active}, Location: ${JSON.stringify(r.location)}`);
      });
    }
  }
  
  // Now let's directly query for nearby restaurants instead of using the RPC function
  try {
    // Direct query using PostGIS functions
    const { data, error } = await supabase.query(`
      SELECT 
        id as restaurant_id, 
        user_id,
        name,
        ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) / 1000 as distance_km
      FROM 
        restaurants
      WHERE 
        is_active = true
        AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3 * 1000
        )
      ORDER BY 
        distance_km
      LIMIT $4
    `, [longitude, latitude, maxDistance, limit]);

    if (error) {
      console.error('Error finding nearest restaurants:', error);
      return [];
    }

    // Log the restaurant data to help with debugging
    console.log('Found nearby restaurants:', data);
    
    if (!data || data.length === 0) {
      console.log(`No restaurants found within ${maxDistance}km of (${latitude}, ${longitude})`);
      
      // If no restaurants within range, do a broader search without the distance limit
      // to see what's the closest restaurant
      const { data: broadSearch, error: broadSearchError } = await supabase.query(`
        SELECT 
          id as restaurant_id, 
          user_id,
          name,
          ST_Distance(
            location::geography,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          ) / 1000 as distance_km
        FROM 
          restaurants
        WHERE 
          is_active = true
        ORDER BY 
          distance_km
        LIMIT 5
      `, [longitude, latitude]);
      
      if (broadSearchError) {
        console.error('Error in broad search query:', broadSearchError);
      } else {
        console.log('Closest restaurants (without distance limit):', broadSearch);
      }
    }
    
    // Return data as an empty array if it's null
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
