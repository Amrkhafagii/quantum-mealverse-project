import { supabase } from '@/integrations/supabase/client';
import { DeliveryUser, DeliveryVehicle, DeliveryDocument } from '@/types/delivery';

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

    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ').trim();

    let status: DeliveryUser['status'];
    switch (data.status) {
      case 'active':
      case 'inactive':
      case 'suspended':
      case 'on_break':
        status = (data.status === 'on_break') ? 'inactive' : data.status;
        break;
      default:
        status = 'inactive';
    }

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
      rating: typeof data.rating === 'number' ? data.rating
        : typeof data.average_rating === 'number' ? data.average_rating : 0,
      total_deliveries: typeof data.total_deliveries === 'number' ? data.total_deliveries : 0,
      verification_status,
      background_check_status,
      is_available: typeof data.is_available === 'boolean' ? data.is_available : false,
      last_active: typeof data.last_active === 'string' ? data.last_active : '',
      created_at: typeof data.created_at === 'string' ? data.created_at : '',
      updated_at: typeof data.updated_at === 'string' ? data.updated_at : '',
    };
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
        updated_at: new Date().toISOString()
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

export const getVehicleByDeliveryUserId = async (deliveryUserId: string): Promise<DeliveryVehicle | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_vehicles')
      .select('*')
      .eq('delivery_vehicles_user_id', deliveryUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching vehicle:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error in getVehicleByDeliveryUserId:', error);
    return null;
  }
};

export const saveVehicleInfo = async (vehicleData: Partial<DeliveryVehicle>): Promise<boolean> => {
  try {
    const { delivery_user_id, ...updateData } = vehicleData;
    
    // Convert the data to match database schema
    const dbData = {
      delivery_vehicles_user_id: delivery_user_id,
      vehicle_type: updateData.type || updateData.vehicle_type,
      make: updateData.make || '',
      model: updateData.model || '',
      year: updateData.year || new Date().getFullYear(),
      color: updateData.color || '',
      license_plate: updateData.license_plate || '',
      is_active: true,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('delivery_vehicles')
      .upsert(dbData, {
        onConflict: 'delivery_vehicles_user_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error saving vehicle info:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveVehicleInfo:', error);
    return false;
  }
};

export const getDeliveryDocuments = async (userId: string): Promise<DeliveryDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('delivery_documents')
      .select('*')
      .eq('delivery_documents_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching delivery documents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDeliveryDocuments:', error);
    return [];
  }
};

// ----------------- Delivery Onboarding Onboarding Service Placeholders -----------------

/** 
 * Creates a delivery user in the database.
 * TODO: Implement the actual logic.
 */
export const createDeliveryUser = async (...args: any[]): Promise<any> => {
  throw new Error("createDeliveryUser not implemented");
};

/** 
 * Uploads a delivery document for a user.
 * TODO: Implement the actual logic.
 */
export const uploadDeliveryDocument = async (...args: any[]): Promise<any> => {
  throw new Error("uploadDeliveryDocument not implemented");
};

/** 
 * Gets all documents by delivery user ID.
 * TODO: Implement the actual logic.
 */
export const getDocumentsByDeliveryUserId = async (...args: any[]): Promise<any> => {
  throw new Error("getDocumentsByDeliveryUserId not implemented");
};

/** 
 * Saves a delivery user's availability schedule.
 * TODO: Implement the actual logic.
 */
export const saveAvailability = async (...args: any[]): Promise<any> => {
  throw new Error("saveAvailability not implemented");
};

/**
 * Gets availability schedule for a delivery user.
 * TODO: Implement the actual logic.
 */
export const getAvailabilityByDeliveryUserId = async (...args: any[]): Promise<any> => {
  throw new Error("getAvailabilityByDeliveryUserId not implemented");
};

/**
 * Saves payment details for a delivery user.
 * TODO: Implement the actual logic.
 */
export const savePaymentDetails = async (...args: any[]): Promise<any> => {
  throw new Error("savePaymentDetails not implemented");
};

/**
 * Gets payment details for a delivery user.
 * TODO: Implement the actual logic.
 */
export const getPaymentDetailsByDeliveryUserId = async (...args: any[]): Promise<any> => {
  throw new Error("getPaymentDetailsByDeliveryUserId not implemented");
};
