import { supabase } from '@/integrations/supabase/client';

export const restaurantService = {
  async getRestaurant(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('restaurants_user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching restaurant:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      return null;
    }
  },

  async updateRestaurant(restaurantId: string, updates: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurantId)
        .select()
        .single();

      if (error) {
        console.error('Error updating restaurant:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating restaurant:', error);
      return null;
    }
  },

  async createRestaurant(restaurantData: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .insert([restaurantData])
        .select()
        .single();

      if (error) {
        console.error('Error creating restaurant:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      return null;
    }
  },

  async deleteRestaurant(restaurantId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurantId);

      if (error) {
        console.error('Error deleting restaurant:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      return false;
    }
  },

  async getRestaurantsByCity(city: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('city', city);

      if (error) {
        console.error('Error fetching restaurants by city:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching restaurants by city:', error);
      return [];
    }
  },

  async getActiveRestaurants(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching active restaurants:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching active restaurants:', error);
      return [];
    }
  },

  async getRestaurantsByCuisine(cuisineType: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('cuisine_type', cuisineType);

      if (error) {
        console.error('Error fetching restaurants by cuisine:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching restaurants by cuisine:', error);
      return [];
    }
  },

  async updateOpeningHours(restaurantId: string, openingHours: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update({ opening_hours: openingHours })
        .eq('id', restaurantId)
        .select()
        .single();

      if (error) {
        console.error('Error updating opening hours:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating opening hours:', error);
      return null;
    }
  },

  async getRestaurantsWithinRadius(latitude: number, longitude: number, radius: number): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_restaurants_within_radius', {
        input_latitude: latitude,
        input_longitude: longitude,
        input_radius: radius
      });

      if (error) {
        console.error('Error fetching restaurants within radius:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching restaurants within radius:', error);
      return [];
    }
  },

  async verifyRestaurant(restaurantId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update({ is_verified: true, verification_status: 'approved' })
        .eq('id', restaurantId)
        .select()
        .single();

      if (error) {
        console.error('Error verifying restaurant:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error verifying restaurant:', error);
      return null;
    }
  },

  async rejectRestaurantVerification(restaurantId: string, rejectionNotes: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update({ is_verified: false, verification_status: 'rejected', verification_notes: rejectionNotes })
        .eq('id', restaurantId)
        .select()
        .single();

      if (error) {
        console.error('Error rejecting restaurant verification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error rejecting restaurant verification:', error);
      return null;
    }
  },

  async updateRestaurantStatus(restaurantId: string, isActive: boolean): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update({ is_active: isActive })
        .eq('id', restaurantId)
        .select()
        .single();

      if (error) {
        console.error('Error updating restaurant status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      return null;
    }
  },

  async getNearbyRestaurants(latitude: number, longitude: number, radius: number): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_restaurants', {
        input_latitude: latitude,
        input_longitude: longitude,
        input_radius: radius
      });

      if (error) {
        console.error('Error fetching nearby restaurants:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      return [];
    }
  },

  async searchRestaurants(searchTerm: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .ilike('name', `%${searchTerm}%`);

      if (error) {
        console.error('Error searching restaurants:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching restaurants:', error);
      return [];
    }
  },

  async updateRestaurantOnboardingStatus(
    restaurantId: string,
    onboardingStatus: 'not_started' | 'in_progress' | 'pending_review' | 'completed' | 'rejected',
    onboardingStep?: number
  ): Promise<any | null> {
    try {
      const updates: any = { onboarding_status: onboardingStatus };
      if (onboardingStep !== undefined) {
        updates.onboarding_step = onboardingStep;
      }

      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurantId)
        .select()
        .single();

      if (error) {
        console.error('Error updating restaurant onboarding status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating restaurant onboarding status:', error);
      return null;
    }
  },

  async getRestaurantsPendingVerification(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('verification_status', 'pending');

      if (error) {
        console.error('Error fetching restaurants pending verification:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching restaurants pending verification:', error);
      return [];
    }
  },

  async getRestaurantsUnderReview(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('verification_status', 'under_review');

      if (error) {
        console.error('Error fetching restaurants under review:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching restaurants under review:', error);
      return [];
    }
  },

  async updateRestaurantDeliverySettings(
    restaurantId: string,
    deliveryRadius: number,
    minimumOrderAmount?: number,
    deliveryFee?: number,
    estimatedDeliveryTime?: number
  ): Promise<any | null> {
    try {
      const updates: any = {
        delivery_radius: deliveryRadius
      };

      if (minimumOrderAmount !== undefined) {
        updates.minimum_order_amount = minimumOrderAmount;
      }

      if (deliveryFee !== undefined) {
        updates.delivery_fee = deliveryFee;
      }

      if (estimatedDeliveryTime !== undefined) {
        updates.estimated_delivery_time = estimatedDeliveryTime;
      }

      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurantId)
        .select()
        .single();

      if (error) {
        console.error('Error updating restaurant delivery settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating restaurant delivery settings:', error);
      return null;
    }
  }
};

// Fixed: Use export type for isolated modules
export type { Restaurant, CreateRestaurantData } from '@/hooks/useRestaurantAuth';
