import { supabase } from '@/integrations/supabase/client';
import { DeliveryUser, DeliveryVehicle, DeliveryDocument } from '@/types/delivery';

export const getDeliveryUserByUserId = async (userId: string): Promise<DeliveryUser | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_users')
      .select('*')
      .eq('delivery_users_user_id', userId) // Updated field name
      .single();

    if (error) {
      console.error('Error fetching delivery user:', error);
      return null;
    }

    return data;
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
      .eq('delivery_users_user_id', userId); // Updated field name

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
      .eq('delivery_vehicles_user_id', deliveryUserId) // Updated field name
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
      delivery_vehicles_user_id: delivery_user_id, // Updated field name
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
        onConflict: 'delivery_vehicles_user_id', // Updated field name
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
      .eq('delivery_documents_user_id', userId) // Updated field name
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
