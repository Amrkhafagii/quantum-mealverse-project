
import { supabase } from '@/integrations/supabase/client';
import { DeliveryUser, DeliveryVehicle, DeliveryDocument, DeliveryPaymentDetails } from '@/types/delivery';

export const saveDeliveryUserInfo = async (
  userData: Partial<DeliveryUser>
): Promise<DeliveryUser> => {
  try {
    // Map TypeScript fields to database fields
    const dbData = {
      delivery_users_user_id: userData.delivery_users_user_id || '',
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      phone: userData.phone || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('delivery_users')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    // Map database response to TypeScript type
    const deliveryUser: DeliveryUser = {
      id: data.id,
      delivery_users_user_id: data.delivery_users_user_id,
      full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      vehicle_type: '', // Not in DB, set default
      license_plate: '', // Not in DB, set default
      driver_license_number: '', // Not in DB, set default
      status: 'inactive' as const,
      rating: data.average_rating || 0,
      total_deliveries: data.total_deliveries || 0,
      verification_status: 'pending' as const,
      background_check_status: 'pending' as const,
      is_available: false,
      is_approved: data.is_approved || false,
      last_active: data.updated_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return deliveryUser;
  } catch (error) {
    console.error('Error saving delivery user info:', error);
    throw new Error('Failed to save delivery user information');
  }
};

export const updateDeliveryUserInfo = async (
  userId: string,
  userData: Partial<DeliveryUser>
): Promise<DeliveryUser> => {
  try {
    // Map TypeScript fields to database fields
    const dbData = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('delivery_users')
      .update(dbData)
      .eq('delivery_users_user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Map database response to TypeScript type
    const deliveryUser: DeliveryUser = {
      id: data.id,
      delivery_users_user_id: data.delivery_users_user_id,
      full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      vehicle_type: '', // Not in DB, set default
      license_plate: '', // Not in DB, set default
      driver_license_number: '', // Not in DB, set default
      status: 'inactive' as const,
      rating: data.average_rating || 0,
      total_deliveries: data.total_deliveries || 0,
      verification_status: 'pending' as const,
      background_check_status: 'pending' as const,
      is_available: false,
      is_approved: data.is_approved || false,
      last_active: data.updated_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return deliveryUser;
  } catch (error) {
    console.error('Error updating delivery user info:', error);
    throw new Error('Failed to update delivery user information');
  }
};

// Valid document types according to the TypeScript interface
const VALID_DOCUMENT_TYPES = [
  'license',
  'insurance', 
  'registration',
  'background_check',
  'profile_photo',
  'drivers_license',
  'vehicle_registration',
  'identity'
] as const;

export const uploadDeliveryDocument = async (
  file: File,
  documentType: string,
  userId: string,
  expiryDate?: Date,
  notes?: string
): Promise<DeliveryDocument> => {
  try {
    // Validate document type
    if (!VALID_DOCUMENT_TYPES.includes(documentType as any)) {
      throw new Error(`Invalid document type: ${documentType}`);
    }

    // Upload file to storage
    const fileName = `${userId}/${documentType}_${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('delivery-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('delivery-documents')
      .getPublicUrl(fileName);

    // Save document record
    const dbData = {
      delivery_user_id: userId,
      document_type: documentType,
      file_path: publicUrl,
      expiry_date: expiryDate?.toISOString().split('T')[0],
      notes: notes || null,
      verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('delivery_documents')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    // Map to TypeScript type
    const document: DeliveryDocument = {
      id: data.id,
      delivery_documents_user_id: data.delivery_user_id,
      document_type: data.document_type as DeliveryDocument['document_type'],
      document_url: data.file_path,
      verification_status: data.verified ? 'approved' : 'pending',
      expiry_date: data.expiry_date,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return document;
  } catch (error) {
    console.error('Error uploading delivery document:', error);
    throw new Error('Failed to upload document');
  }
};

export const getDeliveryDocuments = async (userId: string): Promise<DeliveryDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('delivery_documents')
      .select('*')
      .eq('delivery_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map and filter valid document types
    const documents: DeliveryDocument[] = data
      .filter(doc => VALID_DOCUMENT_TYPES.includes(doc.document_type as any))
      .map(doc => ({
        id: doc.id,
        delivery_documents_user_id: doc.delivery_user_id,
        document_type: doc.document_type as DeliveryDocument['document_type'],
        document_url: doc.file_path,
        verification_status: doc.verified ? 'approved' : 'pending',
        expiry_date: doc.expiry_date,
        notes: doc.notes,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      }));

    return documents;
  } catch (error) {
    console.error('Error fetching delivery documents:', error);
    throw new Error('Failed to fetch documents');
  }
};

export const saveDeliveryAvailability = async (
  userId: string,
  scheduleData: any
): Promise<void> => {
  try {
    // Clear existing schedules
    await supabase
      .from('delivery_availability')
      .delete()
      .eq('delivery_user_id', userId);

    // Insert new schedules
    const scheduleRecords = scheduleData.map((schedule: any) => ({
      delivery_user_id: userId,
      day_of_week: schedule.dayOfWeek,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      is_recurring: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('delivery_availability')
      .insert(scheduleRecords);

    if (error) throw error;
  } catch (error) {
    console.error('Error saving delivery availability:', error);
    throw new Error('Failed to save availability schedule');
  }
};

export const saveDeliveryPaymentDetails = async (
  paymentData: Partial<DeliveryPaymentDetails>
): Promise<DeliveryPaymentDetails> => {
  try {
    // Map TypeScript fields to database fields for insert
    const dbData = {
      delivery_user_id: paymentData.delivery_payment_details_user_id || '',
      account_name: paymentData.account_holder_name || '',
      bank_name: paymentData.bank_name || '',
      account_number: paymentData.account_number || '',
      routing_number: paymentData.routing_number || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('delivery_payment_details')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    // Map database response back to TypeScript type
    const paymentDetails: DeliveryPaymentDetails = {
      id: data.id,
      delivery_payment_details_user_id: data.delivery_user_id,
      bank_name: data.bank_name,
      account_number: data.account_number,
      routing_number: data.routing_number,
      account_holder_name: data.account_name,
      account_type: 'checking' as const, // Default since not in DB
      is_verified: false, // Default since not in DB
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return paymentDetails;
  } catch (error) {
    console.error('Error saving payment details:', error);
    throw new Error('Failed to save payment details');
  }
};

export const getDeliveryPaymentDetails = async (userId: string): Promise<DeliveryPaymentDetails | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_payment_details')
      .select('*')
      .eq('delivery_user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Map database response to TypeScript type
    const paymentDetails: DeliveryPaymentDetails = {
      id: data.id,
      delivery_payment_details_user_id: data.delivery_user_id,
      bank_name: data.bank_name,
      account_number: data.account_number,
      routing_number: data.routing_number,
      account_holder_name: data.account_name,
      account_type: 'checking' as const, // Default since not in DB
      is_verified: false, // Default since not in DB
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return paymentDetails;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return null;
  }
};
