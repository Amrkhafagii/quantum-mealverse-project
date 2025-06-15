
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
      return this.mapDatabaseToRestaurant(data);
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
      return this.mapDatabaseToRestaurant(data);
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
      return (data || []).map(restaurant => this.mapDatabaseToRestaurant(restaurant));
    } catch (error) {
      console.error('Error in getRestaurants:', error);
      return [];
    }
  }

  async createRestaurants(restaurants: Partial<Restaurant>[]): Promise<Restaurant[]> {
    try {
      // Map Restaurant interface fields to database fields
      const restaurantsForDb = restaurants.map(restaurant => this.mapRestaurantToDatabase(restaurant));

      const { data, error } = await supabase
        .from('restaurants')
        .insert(restaurantsForDb)
        .select();

      if (error) {
        console.error('Error creating restaurants:', error);
        return [];
      }

      // Map back to Restaurant interface
      return (data || []).map(restaurant => this.mapDatabaseToRestaurant(restaurant));
    } catch (error) {
      console.error('Error in createRestaurants:', error);
      return [];
    }
  }

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant> {
    try {
      // Map Restaurant interface fields to database fields
      const updatesForDb = this.mapRestaurantToDatabase(updates);

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
      return this.mapDatabaseToRestaurant(data);
    } catch (error) {
      console.error('Error in updateRestaurant:', error);
      throw error;
    }
  }

  // Get restaurants within radius - using proper RPC call
  static async getRestaurantsWithinRadius(latitude: number, longitude: number, radiusKm: number = 20): Promise<Restaurant[]> {
    try {
      // Use a simple query instead of non-existent RPC
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching restaurants within radius:', error);
        return [];
      }

      // Filter by distance and map to Restaurant interface
      const restaurantService = new RestaurantService();
      return (data || [])
        .filter(restaurant => {
          if (!restaurant.latitude || !restaurant.longitude) return false;
          
          // Calculate distance using Haversine formula
          const R = 6371; // Earth's radius in km
          const dLat = (restaurant.latitude - latitude) * Math.PI / 180;
          const dLon = (restaurant.longitude - longitude) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(latitude * Math.PI / 180) * Math.cos(restaurant.latitude * Math.PI / 180) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          return distance <= radiusKm;
        })
        .map(restaurant => restaurantService.mapDatabaseToRestaurant(restaurant));
    } catch (error) {
      console.error('Error in getRestaurantsWithinRadius:', error);
      return [];
    }
  }

  // Get nearby restaurants
  static async getNearbyRestaurants(latitude: number, longitude: number, radius: number = 10): Promise<Restaurant[]> {
    return this.getRestaurantsWithinRadius(latitude, longitude, radius);
  }

  // Helper method to map database response to Restaurant interface
  private mapDatabaseToRestaurant(data: any): Restaurant {
    return {
      id: data.id,
      user_id: data.restaurants_user_id || data.user_id,
      name: data.name,
      address: data.address,
      city: data.city,
      country: data.country || 'USA',
      phone: data.phone,
      phone_number: data.phone_number,
      email: data.email,
      description: data.description,
      is_active: data.is_active,
      latitude: data.latitude,
      longitude: data.longitude,
      created_at: data.created_at,
      updated_at: data.updated_at,
      logo_url: data.logo_url,
      cover_image_url: data.cover_image_url,
      cuisine_type: data.cuisine_type,
      delivery_fee: data.delivery_fee,
      delivery_radius: data.delivery_radius,
      rating: data.rating,
      menu_url: data.menu_url,
      business_license: data.business_license,
      website_url: data.website_url,
      opening_hours: this.parseOpeningHours(data.opening_hours),
      payment_methods: data.payment_methods,
      terms_and_conditions: data.terms_and_conditions,
      privacy_policy: data.privacy_policy,
      cancellation_policy: data.cancellation_policy,
      verification_status: data.verification_status,
      is_verified: data.is_verified,
      onboarding_status: data.onboarding_status,
      onboarding_step: data.onboarding_step,
      onboarding_completed_at: data.onboarding_completed_at,
      postal_code: data.postal_code,
      minimum_order_amount: data.minimum_order_amount,
      estimated_delivery_time: data.estimated_delivery_time,
      verification_notes: data.verification_notes,
    };
  }

  // Helper method to map Restaurant interface to database fields
  private mapRestaurantToDatabase(restaurant: Partial<Restaurant>): any {
    const dbData: any = { ...restaurant };
    
    // Map user_id to restaurants_user_id for database
    if (restaurant.user_id) {
      dbData.restaurants_user_id = restaurant.user_id;
      delete dbData.user_id;
    }

    // Handle opening_hours conversion
    if (restaurant.opening_hours) {
      dbData.opening_hours = restaurant.opening_hours;
    }

    return dbData;
  }

  // Helper method to parse opening hours from database
  private parseOpeningHours(openingHours: any): { [key: string]: { open: string; close: string } } | undefined {
    if (!openingHours) return undefined;
    
    // If it's already an object, return it
    if (typeof openingHours === 'object' && !Array.isArray(openingHours)) {
      return openingHours as { [key: string]: { open: string; close: string } };
    }
    
    // If it's a string, try to parse it
    if (typeof openingHours === 'string') {
      try {
        return JSON.parse(openingHours);
      } catch {
        return undefined;
      }
    }
    
    return undefined;
  }
}

export const restaurantService = new RestaurantService();
export type { Restaurant };
export default RestaurantService;
