
import { supabase } from '@/integrations/supabase/client';
import { UserType, DeliveryUser, RestaurantUser, CustomerProfile } from '@/types/user';

export const getUserType = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('user_types')
      .select('type')
      .eq('user_types_user_id', userId) // Updated field name
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user type:', error);
      return null;
    }

    return data?.type || null;
  } catch (error) {
    console.error('Error in getUserType:', error);
    return null;
  }
};

export const createUserType = async (userId: string, type: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_types')
      .upsert({
        user_types_user_id: userId, // Updated field name
        type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_types_user_id' // Updated field name
      });

    if (error) {
      console.error('Error creating user type:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createUserType:', error);
    return false;
  }
};

export const getDeliveryUserProfile = async (userId: string): Promise<DeliveryUser | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_users')
      .select('*')
      .eq('delivery_users_user_id', userId) // Updated field name
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching delivery user profile:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error in getDeliveryUserProfile:', error);
    return null;
  }
};

export const getRestaurantUserProfile = async (userId: string): Promise<RestaurantUser | null> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('restaurants_user_id', userId) // Updated field name
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching restaurant user profile:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error in getRestaurantUserProfile:', error);
    return null;
  }
};

export const getCustomerProfile = async (userId: string): Promise<CustomerProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('customer_profiles_user_id', userId) // Updated field name
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching customer profile:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error in getCustomerProfile:', error);
    return null;
  }
};
