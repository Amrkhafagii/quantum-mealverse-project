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

    // Strict string fallback
    const safeStr = (v: any) => typeof v === 'string' ? v : '';

    // Compose as in userService
    const firstName = typeof data.first_name === 'string' ? data.first_name : '';
    const lastName = typeof data.last_name === 'string' ? data.last_name : '';
    const fullName = typeof data.full_name === 'string'
      ? data.full_name
      : [firstName, lastName].filter(Boolean).join(' ').trim();

    const status: DeliveryUser['status'] =
      data.status === "active" || data.status === "inactive" || data.status === "suspended" || data.status === "on_break"
        ? data.status
        : "inactive";

    const verification_status: DeliveryUser['verification_status'] =
      data.verification_status === "pending" || data.verification_status === "verified" || data.verification_status === "rejected"
        ? data.verification_status
        : "pending";

    const background_check_status: DeliveryUser['background_check_status'] =
      data.background_check_status === "pending" || data.background_check_status === "approved" || data.background_check_status === "rejected"
        ? data.background_check_status
        : "pending";

    return {
      id: safeStr(data.id),
      delivery_users_user_id: safeStr(data.delivery_users_user_id),
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      phone: safeStr(data.phone),
      vehicle_type: safeStr(data.vehicle_type),
      license_plate: safeStr(data.license_plate),
      driver_license_number: safeStr(data.driver_license_number),
      status,
      rating: typeof data.rating === "number"
        ? data.rating
        : typeof data.average_rating === "number"
          ? data.average_rating
          : 0,
      total_deliveries: typeof data.total_deliveries === "number" ? data.total_deliveries : 0,
      verification_status,
      background_check_status,
      is_available: !!data.is_available,
      is_approved: !!data.is_approved,
      last_active: safeStr(data.last_active),
      created_at: safeStr(data.created_at),
      updated_at: safeStr(data.updated_at),
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
