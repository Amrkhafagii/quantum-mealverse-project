import { supabase } from '@/integrations/supabase/client';
import { DeliveryUser } from '@/types/delivery';

// Get user by supabase user id
export const getDeliveryUserByUserId = async (
  userId: string
): Promise<DeliveryUser | null> => {
  try {
    // Use .select('*') for correct Supabase typing
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

    const fullName = [
      typeof data.first_name === 'string' ? data.first_name : '',
      typeof data.last_name === 'string' ? data.last_name : '',
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

    let status: DeliveryUser['status'] = 'inactive';
    if ('status' in data && typeof data.status === 'string') {
      switch (data.status) {
        case 'active':
        case 'inactive':
        case 'suspended':
        case 'on_break':
          status = data.status as DeliveryUser['status'];
          break;
        default:
          status = 'inactive';
      }
    }

    // Defensive: provide field only if present in the data
    const user: DeliveryUser = {
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
      rating:
        typeof data.average_rating === 'number'
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

    return user;
  } catch (error) {
    console.error('Error in getDeliveryUserByUserId:', error);
    return null;
  }
};

export const updateDeliveryUserStatus = async (
  userId: string,
  status: 'active' | 'inactive' | 'suspended'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('delivery_users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('delivery_users_user_id', userId);

    if (error) {
      console.error('Error updating delivery user status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateDeliveryUserStatus:', error);
    return false;
  }
};

export const updateDeliveryUserProfile = async (
  deliveryUserId: string,
  profileData: Partial<DeliveryUser>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('delivery_users')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliveryUserId);

    if (error) {
      console.error('Error updating delivery user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateDeliveryUserProfile:', error);
    return false;
  }
};
