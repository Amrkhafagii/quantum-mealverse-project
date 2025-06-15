import { supabase } from '@/integrations/supabase/client';
import type { Restaurant } from '@/types/restaurant';

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*');

  if (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }

  return (data || []).map(restaurant => ({
    ...restaurant,
    user_id: restaurant.restaurants_user_id,
    name: restaurant.name || 'Unnamed Restaurant',
    address: restaurant.address || 'No Address',
    city: restaurant.city || 'Unknown',
    cuisine_type: restaurant.cuisine_type || 'Unknown',
    delivery_fee: restaurant.delivery_fee || 0,
    delivery_radius: restaurant.delivery_radius || 0,
    rating: restaurant.rating || 0,
    menu_url: restaurant.menu_url || '',
    cover_image_url: restaurant.cover_image_url || '',
    is_active: restaurant.is_active !== false,
    created_at: restaurant.created_at || new Date().toISOString(),
    updated_at: restaurant.updated_at || new Date().toISOString(),
  })) as Restaurant[];
};

export const getRestaurantProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('restaurants_user_id', userId) // Use correct database field name
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No restaurant found
      }
      throw error;
    }

    // Map database fields to expected format
    return {
      ...data,
      user_id: data.restaurants_user_id, // Map from database field to expected field
      name: data.name || 'Unnamed Restaurant',
      address: data.address || 'No Address',
      city: data.city || 'Unknown',
      cuisine_type: data.cuisine_type || 'Unknown',
      delivery_fee: data.delivery_fee || 0,
      delivery_radius: data.delivery_radius || 0,
      rating: data.rating || 0,
      menu_url: data.menu_url || '',
      cover_image_url: data.cover_image_url || '',
      is_active: data.is_active !== false,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching restaurant profile:", error);
    throw error;
  }
};

export const updateRestaurantProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('restaurants_user_id', userId) // Use correct database field name
      .select()
      .single();

    if (error) throw error;

    // Map database fields to expected format
    return {
      ...data,
      user_id: data.restaurants_user_id, // Map from database field to expected field
      name: data.name || 'Unnamed Restaurant',
      address: data.address || 'No Address',
      city: data.city || 'Unknown',
      cuisine_type: data.cuisine_type || 'Unknown',
      delivery_fee: data.delivery_fee || 0,
      delivery_radius: data.delivery_radius || 0,
      rating: data.rating || 0,
      menu_url: data.menu_url || '',
      cover_image_url: data.cover_image_url || '',
      is_active: data.is_active !== false,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error updating restaurant profile:", error);
    throw error;
  }
};

export const createRestaurant = async (restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>): Promise<Restaurant> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        restaurants_user_id: restaurantData.user_id,
        name: restaurantData.name,
        address: restaurantData.address,
        city: restaurantData.city,
        country: restaurantData.country,
        cuisine_type: restaurantData.cuisine_type,
        delivery_fee: restaurantData.delivery_fee,
        delivery_radius: restaurantData.delivery_radius,
        rating: restaurantData.rating,
        menu_url: restaurantData.menu_url,
        cover_image_url: restaurantData.cover_image_url,
        is_active: restaurantData.is_active,
        business_license: restaurantData.business_license,
        phone_number: restaurantData.phone_number,
        email: restaurantData.email,
        website_url: restaurantData.website_url,
        opening_hours: restaurantData.opening_hours,
        payment_methods: restaurantData.payment_methods,
        description: restaurantData.description,
        terms_and_conditions: restaurantData.terms_and_conditions,
        privacy_policy: restaurantData.privacy_policy,
        cancellation_policy: restaurantData.cancellation_policy,
        verification_status: restaurantData.verification_status,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    }

    return {
      ...data,
      user_id: data.restaurants_user_id,
      name: data.name || 'Unnamed Restaurant',
      address: data.address || 'No Address',
      city: data.city || 'Unknown',
      cuisine_type: data.cuisine_type || 'Unknown',
      delivery_fee: data.delivery_fee || 0,
      delivery_radius: data.delivery_radius || 0,
      rating: data.rating || 0,
      menu_url: data.menu_url || '',
      cover_image_url: data.cover_image_url || '',
      is_active: data.is_active !== false,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    } as Restaurant;
  } catch (error) {
    console.error("Error creating restaurant:", error);
    throw error;
  }
};
