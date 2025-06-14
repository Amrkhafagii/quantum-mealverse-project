
import { supabase } from '@/integrations/supabase/client';
import { UserType, DeliveryUser, RestaurantUser, CustomerProfile } from '@/types/user';

export const getUserType = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('user_types')
      .select('type')
      .eq('user_types_user_id', userId)
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
        user_types_user_id: userId,
        type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_types_user_id'
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
      .eq('delivery_users_user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching delivery user profile:', error);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id ?? "",
      delivery_users_user_id: data.delivery_users_user_id ?? "",
      first_name: data.first_name ?? "",
      last_name: data.last_name ?? "",
      full_name:
        typeof data.full_name === "string"
          ? data.full_name
          : ((data.first_name ?? "") + " " + (data.last_name ?? "")).trim(),
      phone: data.phone ?? "",
      vehicle_type: data.vehicle_type ?? "",
      license_plate: data.license_plate ?? "",
      driver_license_number: data.driver_license_number ?? "",
      status:
        typeof data.status === "string" && ["active", "inactive", "suspended"].includes(data.status)
          ? data.status
          : "inactive",
      rating:
        typeof data.rating === "number" ? data.rating
        : (typeof data.average_rating === "number" ? data.average_rating : 0),
      total_deliveries:
        typeof data.total_deliveries === "number" ? data.total_deliveries : 0,
      verification_status:
        typeof data.verification_status === "string" && ["pending", "verified", "rejected"].includes(data.verification_status)
          ? data.verification_status
          : "pending",
      background_check_status:
        typeof data.background_check_status === "string" && ["pending", "approved", "rejected"].includes(data.background_check_status)
          ? data.background_check_status
          : "pending",
      is_available: !!data.is_available,
      is_approved: !!data.is_approved,
      last_active: typeof data.last_active === "string" ? data.last_active : "",
      created_at: typeof data.created_at === "string" ? data.created_at : "",
      updated_at: typeof data.updated_at === "string" ? data.updated_at : "",
    };
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
      .eq('restaurants_user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching restaurant user profile:', error);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id ?? "",
      restaurants_user_id: data.restaurants_user_id ?? "",
      name: data.name ?? "",
      address: data.address ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      description: typeof data.description === "string" ? data.description : undefined,
      cuisine_type: typeof data.cuisine_type === "string" ? data.cuisine_type : undefined,
      is_active: !!data.is_active,
      verification_status:
        typeof data.verification_status === "string" && ["pending", "verified", "rejected"].includes(data.verification_status)
          ? data.verification_status
          : "pending",
      latitude: typeof data.latitude === "number" ? data.latitude : undefined,
      longitude: typeof data.longitude === "number" ? data.longitude : undefined,
      created_at: typeof data.created_at === "string" ? data.created_at : "",
      updated_at: typeof data.updated_at === "string" ? data.updated_at : "",
    };
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
      .eq('customer_profiles_user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching customer profile:', error);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id ?? "",
      customer_profiles_user_id: data.customer_profiles_user_id ?? "",
      email: typeof data.email === "string" ? data.email : undefined,
      full_name: typeof data.full_name === "string" ? data.full_name : undefined,
      phone: typeof data.phone === "string" ? data.phone : undefined,
      date_of_birth: typeof data.date_of_birth === "string" ? data.date_of_birth : undefined,
      dietary_preferences: Array.isArray(data.dietary_preferences) ? data.dietary_preferences : undefined,
      allergies: Array.isArray(data.allergies) ? data.allergies : undefined,
      default_delivery_address:
        typeof data.default_delivery_address === "string" ? data.default_delivery_address : undefined,
      loyalty_points:
        typeof data.loyalty_points === "number" ? data.loyalty_points : undefined,
      created_at: typeof data.created_at === "string" ? data.created_at : undefined,
      updated_at: typeof data.updated_at === "string" ? data.updated_at : undefined,
    };
  } catch (error) {
    console.error('Error in getCustomerProfile:', error);
    return null;
  }
};

