import { supabase } from '@/integrations/supabase/client';
import { 
  DeliveryUser, 
  DeliveryVehicle, 
  DeliveryDocument,
  DeliveryAvailability,
  DeliveryPaymentDetails
} from '@/types/delivery';
import { SupabaseSchema } from '@/types/supabase';

// Create delivery user profile
export const createDeliveryUser = async (userData: Omit<DeliveryUser, 'id' | 'created_at' | 'updated_at' | 'average_rating' | 'total_deliveries' | 'is_approved'>): Promise<DeliveryUser | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('Error creating delivery user:', error);
      throw error;
    }

    return data as DeliveryUser;
  } catch (error) {
    console.error('Error in createDeliveryUser:', error);
    throw error;
  }
};

// Get delivery user by auth user_id
export const getDeliveryUserByUserId = async (userId: string): Promise<DeliveryUser | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No data found
      }
      console.error('Error fetching delivery user:', error);
      throw error;
    }

    return data as DeliveryUser;
  } catch (error) {
    console.error('Error in getDeliveryUserByUserId:', error);
    throw error;
  }
};

// Update delivery user status
export const updateDeliveryUserStatus = async (userId: string, status: 'active' | 'inactive' | 'on_break'): Promise<DeliveryUser | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating delivery user status:', error);
      throw error;
    }

    return data as DeliveryUser;
  } catch (error) {
    console.error('Error in updateDeliveryUserStatus:', error);
    throw error;
  }
};

// Update delivery user profile
export const updateDeliveryUserProfile = async (
  deliveryUserId: string, 
  profileData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
  }
): Promise<DeliveryUser | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_users')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', deliveryUserId)
      .select()
      .single();

    if (error) {
      console.error('Error updating delivery user profile:', error);
      throw error;
    }

    return data as DeliveryUser;
  } catch (error) {
    console.error('Error in updateDeliveryUserProfile:', error);
    throw error;
  }
};

// Save vehicle information
export const saveVehicleInfo = async (vehicleData: Omit<DeliveryVehicle, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryVehicle | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_vehicles')
      .insert(vehicleData)
      .select()
      .single();

    if (error) {
      console.error('Error saving vehicle information:', error);
      throw error;
    }

    return data as DeliveryVehicle;
  } catch (error) {
    console.error('Error in saveVehicleInfo:', error);
    throw error;
  }
};

// Get vehicle by delivery_user_id
export const getVehicleByDeliveryUserId = async (deliveryUserId: string): Promise<DeliveryVehicle | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_vehicles')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No data found
      }
      console.error('Error fetching vehicle:', error);
      throw error;
    }

    return data as DeliveryVehicle;
  } catch (error) {
    console.error('Error in getVehicleByDeliveryUserId:', error);
    throw error;
  }
};

// Upload document
export const uploadDeliveryDocument = async (
  file: File, 
  documentType: DeliveryDocument['document_type'],
  deliveryUserId: string,
  expiryDate?: Date,
  notes?: string
): Promise<DeliveryDocument | null> => {
  try {
    // First upload the file to storage
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const fileName = `${userId}/${documentType}/${Date.now()}_${file.name}`;
    
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('delivery_documents')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading document:', uploadError);
      throw uploadError;
    }

    // Then save the document record
    const { data: docData, error: docError } = await supabase
      .from('delivery_documents')
      .insert({
        delivery_user_id: deliveryUserId,
        document_type: documentType,
        file_path: fileName,
        expiry_date: expiryDate?.toISOString().split('T')[0],
        notes
      })
      .select()
      .single();

    if (docError) {
      console.error('Error saving document record:', docError);
      throw docError;
    }

    return docData as DeliveryDocument;
  } catch (error) {
    console.error('Error in uploadDeliveryDocument:', error);
    throw error;
  }
};

// Get documents by delivery_user_id
export const getDocumentsByDeliveryUserId = async (deliveryUserId: string): Promise<DeliveryDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('delivery_documents')
      .select('*')
      .eq('delivery_user_id', deliveryUserId);

    if (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }

    return data as DeliveryDocument[];
  } catch (error) {
    console.error('Error in getDocumentsByDeliveryUserId:', error);
    throw error;
  }
};

// Save availability schedule
export const saveAvailability = async (availabilityData: Omit<DeliveryAvailability, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryAvailability | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_availability')
      .insert(availabilityData)
      .select()
      .single();

    if (error) {
      console.error('Error saving availability:', error);
      throw error;
    }

    return data as DeliveryAvailability;
  } catch (error) {
    console.error('Error in saveAvailability:', error);
    throw error;
  }
};

// Get availability by delivery_user_id
export const getAvailabilityByDeliveryUserId = async (deliveryUserId: string): Promise<DeliveryAvailability[]> => {
  try {
    const { data, error } = await supabase
      .from('delivery_availability')
      .select('*')
      .eq('delivery_user_id', deliveryUserId);

    if (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }

    return data as DeliveryAvailability[];
  } catch (error) {
    console.error('Error in getAvailabilityByDeliveryUserId:', error);
    throw error;
  }
};

// Save payment details
export const savePaymentDetails = async (paymentData: Omit<DeliveryPaymentDetails, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryPaymentDetails | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_payment_details')
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      console.error('Error saving payment details:', error);
      throw error;
    }

    return data as DeliveryPaymentDetails;
  } catch (error) {
    console.error('Error in savePaymentDetails:', error);
    throw error;
  }
};

// Get payment details by delivery_user_id
export const getPaymentDetailsByDeliveryUserId = async (deliveryUserId: string): Promise<DeliveryPaymentDetails | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_payment_details')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No data found
      }
      console.error('Error fetching payment details:', error);
      throw error;
    }

    return data as DeliveryPaymentDetails;
  } catch (error) {
    console.error('Error in getPaymentDetailsByDeliveryUserId:', error);
    throw error;
  }
};
