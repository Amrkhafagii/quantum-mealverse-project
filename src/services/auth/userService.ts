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

    const verification_status: RestaurantUser['verification_status'] =
      data.verification_status === "pending" || data.verification_status === "verified" || data.verification_status === "rejected"
        ? data.verification_status
        : "pending";

    return {
      id: typeof data.id === "string" ? data.id : "",
      restaurants_user_id: typeof data.restaurants_user_id === "string" ? data.restaurants_user_id : "",
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

export const getDeliveryUserByUserId = async (userId: string): Promise<DeliveryUser | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_users')
      .select('*')
      .eq('delivery_users_user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching delivery user:', error);
      return null;
    }
    if (!data) return null;

    // Compose full_name from first_name/last_name or fallback
    const fullName = [
      typeof data.first_name === 'string' ? data.first_name : '',
      typeof data.last_name === 'string' ? data.last_name : ''
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    let verification_status: DeliveryUser['verification_status'] = 'pending';
    if ('verification_status' in data && typeof data.verification_status === 'string') {
      if (['pending', 'verified', 'rejected'].includes(data.verification_status)) {
        verification_status = data.verification_status as DeliveryUser['verification_status'];
      }
    }

    let background_check_status: DeliveryUser['background_check_status'] = 'pending';
    if ('background_check_status' in data && typeof data.background_check_status === 'string') {
      if (['pending', 'approved', 'rejected'].includes(data.background_check_status)) {
        background_check_status = data.background_check_status as DeliveryUser['background_check_status'];
      }
    }

    let status: DeliveryUser['status'];
    switch (data.status) {
      case 'active':
      case 'inactive':
      case 'suspended':
      case 'on_break':
        // For the union type, coerce 'on_break' to 'inactive' to satisfy TS type, or change type to allow on_break if you want
        status = data.status === 'on_break' ? 'inactive' : data.status;
        break;
      default:
        status = 'inactive';
    }

    return {
      id: typeof data.id === 'string' ? data.id : '',
      delivery_users_user_id: typeof data.delivery_users_user_id === 'string' ? data.delivery_users_user_id : '',
      full_name: fullName,
      first_name: typeof data.first_name === 'string' ? data.first_name : undefined,
      last_name: typeof data.last_name === 'string' ? data.last_name : undefined,
      phone: typeof data.phone === 'string' ? data.phone : '',
      vehicle_type: typeof data.vehicle_type === 'string' ? data.vehicle_type : '',
      license_plate: typeof data.license_plate === 'string' ? data.license_plate : '',
      driver_license_number: typeof data.driver_license_number === 'string' ? data.driver_license_number : '',
      status,
      rating: typeof data.rating === 'number'
        ? data.rating
        : typeof data.average_rating === 'number'
        ? data.average_rating
        : 0,
      total_deliveries: typeof data.total_deliveries === 'number' ? data.total_deliveries : 0,
      verification_status,
      background_check_status,
      is_available: typeof data.is_available === 'boolean' ? data.is_available : false,
      is_approved: typeof data.is_approved === 'boolean' ? data.is_approved : undefined,
      last_active: typeof data.last_active === 'string' ? data.last_active : '',
      created_at: typeof data.created_at === 'string' ? data.created_at : '',
      updated_at: typeof data.updated_at === 'string' ? data.updated_at : '',
    };
  } catch (error) {
    console.error('Error in getDeliveryUserByUserId:', error);
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
