
import { supabase } from '@/integrations/supabase/client';
import type { Restaurant } from '@/types/restaurant';

class RestaurantService {
  async getRestaurant(userId: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('restaurants_user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching restaurant by user ID:', error);
        return null;
      }

      if (!data) return null;

      // Map database fields to Restaurant interface
      return {
        ...data,
        user_id: data.restaurants_user_id || data.user_id,
      } as Restaurant;
    } catch (error) {
      console.error('Error in getRestaurant:', error);
      return null;
    }
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching restaurant by ID:', error);
        return null;
      }

      if (!data) return null;

      // Map database fields to Restaurant interface
      return {
        ...data,
        user_id: data.restaurants_user_id || data.user_id,
      } as Restaurant;
    } catch (error) {
      console.error('Error in getRestaurantById:', error);
      return null;
    }
  }

  async getRestaurants(): Promise<Restaurant[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*');

      if (error) {
        console.error('Error fetching restaurants:', error);
        return [];
      }

      // Map database fields to Restaurant interface
      return (data || []).map(restaurant => ({
        ...restaurant,
        user_id: restaurant.restaurants_user_id || restaurant.user_id,
      })) as Restaurant[];
    } catch (error) {
      console.error('Error in getRestaurants:', error);
      return [];
    }
  }

  async createRestaurants(restaurants: Partial<Restaurant>[]): Promise<Restaurant[]> {
    try {
      // Map Restaurant interface fields to database fields
      const restaurantsForDb = restaurants.map(restaurant => ({
        ...restaurant,
        restaurants_user_id: restaurant.user_id,
        // Remove user_id to avoid conflicts
        user_id: undefined
      }));

      const { data, error } = await supabase
        .from('restaurants')
        .insert(restaurantsForDb)
        .select();

      if (error) {
        console.error('Error creating restaurants:', error);
        return [];
      }

      // Map back to Restaurant interface
      return (data || []).map(restaurant => ({
        ...restaurant,
        user_id: restaurant.restaurants_user_id || restaurant.user_id,
      })) as Restaurant[];
    } catch (error) {
      console.error('Error in createRestaurants:', error);
      return [];
    }
  }

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant> {
    try {
      // Map Restaurant interface fields to database fields
      const updatesForDb = {
        ...updates,
        restaurants_user_id: updates.user_id,
        // Remove user_id to avoid conflicts
        user_id: undefined
      };

      const { data, error } = await supabase
        .from('restaurants')
        .update(updatesForDb)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating restaurant:', error);
        throw error;
      }

      // Map back to Restaurant interface
      return {
        ...data,
        user_id: data.restaurants_user_id || data.user_id,
      } as Restaurant;
    } catch (error) {
      console.error('Error in updateRestaurant:', error);
      throw error;
    }
  }

  // Get restaurants within radius - using proper RPC call
  static async getRestaurantsWithinRadius(latitude: number, longitude: number, radiusKm: number = 20): Promise<Restaurant[]> {
    try {
      // Use the correct RPC function call syntax
      const { data, error } = await supabase
        .rpc('get_restaurants_within_radius' as any, {
          lat: latitude,
          lng: longitude,
          radius_km: radiusKm
        });

      if (error) {
        console.error('Error fetching restaurants within radius:', error);
        return [];
      }

      // Map database fields to Restaurant interface
      return (data || []).map(restaurant => ({
        ...restaurant,
        user_id: restaurant.restaurants_user_id || restaurant.user_id,
      })) as Restaurant[];
    } catch (error) {
      console.error('Error in getRestaurantsWithinRadius:', error);
      return [];
    }
  }

  // Get nearby restaurants
  static async getNearbyRestaurants(latitude: number, longitude: number, radius: number = 10): Promise<Restaurant[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_nearby_restaurants' as any, {
          lat: latitude,
          lng: longitude,
          radius_km: radius
        });

      if (error) {
        console.error('Error fetching nearby restaurants:', error);
        return [];
      }

      // Map database fields to Restaurant interface
      return (data || []).map(restaurant => ({
        ...restaurant,
        user_id: restaurant.restaurants_user_id || restaurant.user_id,
      })) as Restaurant[];
    } catch (error) {
      console.error('Error in getNearbyRestaurants:', error);
      return [];
    }
  }
}

export const restaurantService = new RestaurantService();
export type { Restaurant };
export default RestaurantService;
