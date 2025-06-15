import { supabase } from '@/integrations/supabase/client';
import { mapDatabaseToRestaurant, mapRestaurantToDatabase } from './restaurant/restaurantMapping';
import type { Restaurant } from '@/types/restaurant';

class RestaurantService {
  async getRestaurant(userId: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('restaurants_user_id', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return mapDatabaseToRestaurant(data);
  }

  async getRestaurantById(id: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return mapDatabaseToRestaurant(data);
  }

  async getRestaurants() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*');

    if (error) throw error;
    return (data || []).map(mapDatabaseToRestaurant);
  }

  async createRestaurants(restaurants: Partial<Restaurant>[]) {
    const restaurantsForDb = restaurants.map(mapRestaurantToDatabase);

    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurantsForDb)
      .select();

    if (error) throw error;
    return (data || []).map(mapDatabaseToRestaurant);
  }

  async updateRestaurant(id: string, updates: Partial<Restaurant>) {
    const updatesForDb = mapRestaurantToDatabase(updates);

    const { data, error } = await supabase
      .from('restaurants')
      .update(updatesForDb)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDatabaseToRestaurant(data);
  }

  static async getRestaurantsWithinRadius(latitude: number, longitude: number, radiusKm: number) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) throw error;
    if (!data) return [];

    // Assume radiusKm validation is handled by the caller.
    return (data || [])
      .filter(restaurant =>
        typeof restaurant.latitude === 'number' &&
        typeof restaurant.longitude === 'number' &&
        getDistanceKm(
          latitude, longitude,
          restaurant.latitude, restaurant.longitude
        ) <= radiusKm
      )
      .map(mapDatabaseToRestaurant);
  }

  static async getNearbyRestaurants(latitude: number, longitude: number, radius: number) {
    return this.getRestaurantsWithinRadius(latitude, longitude, radius);
  }
}

import { getDistanceKm } from './restaurant/restaurantDistance';

export const restaurantService = new RestaurantService();
export type { Restaurant };
export default RestaurantService;
