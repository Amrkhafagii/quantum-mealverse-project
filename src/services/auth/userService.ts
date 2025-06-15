
import { supabase } from '@/integrations/supabase/client';
import { UserType, DeliveryUser, RestaurantUser, CustomerProfile } from '@/types/user';

export const getUserType = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('user_types')
      .select('type')
      .eq('user_id', userId) // changed from user_types_user_id
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
        user_id: userId,
        type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
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

export const getRestaurantUserProfile = async (userId: string): Promise<RestaurantUser | null> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('user_id', userId) // changed from restaurants_user_id
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching restaurant user profile:', error);
      return null;
    }
    if (!data) return null;

    const verification_status: RestaurantUser['verification_status'] =
      data.verification_status === "pending" || data.verification_status === "verified" || data.verification_status === "rejected"
        ? data.verification_status
        : "pending";

    return {
      id: typeof data.id === "string" ? data.id : "",
      restaurants_user_id: typeof data.user_id === "string" ? data.user_id : "",
      name: typeof data.name === "string" ? data.name : "",
      address: typeof data.address === "string" ? data.address : "",
      phone: typeof data.phone === "string" ? data.phone : "",
      email: typeof data.email === "string" ? data.email : "",
      description: typeof data.description === "string" ? data.description : undefined,
      cuisine_type: typeof data.cuisine_type === "string" ? data.cuisine_type : undefined,
      is_active: !!data.is_active,
      verification_status,
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



/**
 * Customer profile: This is commented out because your generated Supabase types do NOT contain "customer_profiles".
 * If/when you add this table to your Supabase schema and re-generate types, you may uncomment and use it.
 */
// export const getCustomerProfile = async (userId: string): Promise<CustomerProfile | null> => {
//   try {
//     const { data, error } = await supabase
//       .from('customer_profiles')
//       .select('*')
//       .eq('customer_profiles_user_id', userId)
//       .maybeSingle();
//
//     if (error && error.code !== 'PGRST116') {
//       console.error('Error fetching customer profile:', error);
//       return null;
//     }
//     if (!data) return null;
//
//     return {
//       id: 'id' in data ? data.id ?? "" : "",
//       customer_profiles_user_id: 'customer_profiles_user_id' in data ? data.customer_profiles_user_id ?? "" : "",
//       email: typeof data.email === "string" ? data.email : undefined,
//       full_name: typeof data.full_name === "string" ? data.full_name : undefined,
//       phone: typeof data.phone === "string" ? data.phone : undefined,
//       date_of_birth: typeof data.date_of_birth === "string" ? data.date_of_birth : undefined,
//       dietary_preferences: Array.isArray(data.dietary_preferences) ? data.dietary_preferences : undefined,
//       allergies: Array.isArray(data.allergies) ? data.allergies : undefined,
//       default_delivery_address: typeof data.default_delivery_address === "string" ? data.default_delivery_address : undefined,
//       loyalty_points: typeof data.loyalty_points === "number" ? data.loyalty_points : undefined,
//       created_at: typeof data.created_at === "string" ? data.created_at : undefined,
//       updated_at: typeof data.updated_at === "string" ? data.updated_at : undefined,
//     };
//   } catch (error) {
//     console.error('Error in getCustomerProfile:', error);
//     return null;
//   }
// };
