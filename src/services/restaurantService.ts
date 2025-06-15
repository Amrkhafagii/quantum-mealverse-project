import { supabase } from '@/integrations/supabase/client';
import type { Restaurant, RestaurantStats, RestaurantHours, RestaurantFilters } from '@/types/restaurant';

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

      return data || null;
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

      return data || null;
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

      return data || [];
    } catch (error) {
      console.error('Error in getRestaurants:', error);
      return [];
    }
  }

  async createRestaurant(restaurant: Restaurant): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .insert([restaurant])
        .select()
        .single();

      if (error) {
        console.error('Error creating restaurant:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createRestaurant:', error);
      return null;
    }
  }

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating restaurant:', error);
        throw error;
      }

      return data as Restaurant;
    } catch (error) {
      console.error('Error in updateRestaurant:', error);
      throw error;
    }
  }

  async deleteRestaurant(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting restaurant:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteRestaurant:', error);
      return false;
    }
  }

  async getRestaurantStats(id: string): Promise<RestaurantStats | null> {
    try {
      const { data, error } = await supabase
        .from('restaurant_stats')
        .select('*')
        .eq('restaurant_id', id)
        .single();

      if (error) {
        console.error('Error fetching restaurant stats:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getRestaurantStats:', error);
      return null;
    }
  }

  async updateRestaurantStats(id: string, updates: Partial<RestaurantStats>): Promise<RestaurantStats | null> {
    try {
      const { data, error } = await supabase
        .from('restaurant_stats')
        .update(updates)
        .eq('restaurant_id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating restaurant stats:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in updateRestaurantStats:', error);
      return null;
    }
  }

  async getRestaurantHours(id: string): Promise<RestaurantHours[]> {
    try {
      const { data, error } = await supabase
        .from('restaurant_hours')
        .select('*')
        .eq('restaurant_id', id);

      if (error) {
        console.error('Error fetching restaurant hours:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRestaurantHours:', error);
      return [];
    }
  }

  async updateRestaurantHours(id: string, hours: RestaurantHours[]): Promise<RestaurantHours[]> {
    try {
      // First, delete existing hours for the restaurant
      const { error: deleteError } = await supabase
        .from('restaurant_hours')
        .delete()
        .eq('restaurant_id', id);

      if (deleteError) {
        console.error('Error deleting existing restaurant hours:', deleteError);
        return [];
      }

      // Then, insert the new hours
      const { data, error } = await supabase
        .from('restaurant_hours')
        .insert(hours)
        .select();

      if (error) {
        console.error('Error updating restaurant hours:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in updateRestaurantHours:', error);
      return [];
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

      return data || [];
    } catch (error) {
      console.error('Error in getRestaurantsWithinRadius:', error);
      return [];
    }
  }

  async getFilteredRestaurants(filters: RestaurantFilters): Promise<Restaurant[]> {
    let query = supabase
      .from('restaurants')
      .select('*');

    if (filters.cuisine_type) {
      query = query.eq('cuisine_type', filters.cuisine_type);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    // Add more filters as needed

    try {
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching filtered restaurants:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFilteredRestaurants:', error);
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

      return data || [];
    } catch (error) {
      console.error('Error in getNearbyRestaurants:', error);
      return [];
    }
  }

  async uploadRestaurantImage(file: File, restaurantId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurantId}/${Date.now()}.${fileExt}`;
  
      const { data, error } = await supabase.storage
        .from('restaurant-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
  
      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }
  
      const { data: publicUrl } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(fileName)
  
      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error in uploadRestaurantImage:', error);
      return null;
    }
  }

  async getRestaurantImages(restaurantId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from('restaurant-images')
        .list(restaurantId);
  
      if (error) {
        console.error('Error listing images:', error);
        return [];
      }
  
      return data.map(item => item.name);
    } catch (error) {
      console.error('Error in getRestaurantImages:', error);
      return [];
    }
  }
}

export const restaurantService = new RestaurantService();
export type { Restaurant, RestaurantStats, RestaurantHours, RestaurantFilters };
