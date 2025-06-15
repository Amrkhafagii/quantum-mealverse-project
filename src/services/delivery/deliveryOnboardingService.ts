
import { supabase } from '@/integrations/supabase/client';
import { DeliveryUser, DeliveryDocument, DeliveryAvailability, DeliveryPaymentDetails } from '@/types/delivery';

// Create a new delivery user profile, returns DeliveryUser
export const createDeliveryUser = async (userData: Partial<DeliveryUser>): Promise<DeliveryUser> => {
  const now = new Date().toISOString();
  const insertData = { ...userData, created_at: now, updated_at: now };

  const { data, error } = await supabase
    .from('delivery_users')
    .insert(insertData)
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Unable to create delivery user');
  return data as DeliveryUser;
};

/**
 * Upload a delivery document (file) and record it in the delivery_documents table.
 * @param userId
 * @param file The File object (input[type=file])
 * @param documentType See DeliveryDocument['document_type'] types
 * @param expiryDate ISO string (optional)
 * @param notes string (optional)
 */
export const uploadDeliveryDocument = async (
  userId: string,
  file: File,
  documentType: DeliveryDocument["document_type"],
  expiryDate?: string,
  notes?: string
): Promise<DeliveryDocument> => {
  // Storage: upload to 'delivery-documents' bucket, path format: userId/documentType_timestamp.ext
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${documentType}_${Date.now()}.${ext}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('delivery-documents')
    .upload(fileName, file);

  if (uploadError) throw new Error(uploadError.message);

  // Get file URL after upload
  const { data: urlData } = supabase.storage
    .from('delivery-documents')
    .getPublicUrl(fileName);
  const publicUrl = urlData.publicUrl;

  // Insert metadata to delivery_documents table
  const { data, error } = await supabase
    .from('delivery_documents')
    .insert({
      delivery_user_id: userId,
      document_type: documentType,
      file_path: fileName,
      document_url: publicUrl,
      expiry_date: expiryDate,
      notes,
      verified: false
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Unable to save delivery document');
  return {
    id: String(data.id),
    delivery_documents_user_id: String(data.delivery_user_id),
    document_type: data.document_type,
    document_url: data.document_url,
    verification_status: data.verified ? 'approved' : 'pending',
    expiry_date: data.expiry_date || undefined,
    notes: data.notes || undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Get all documents for a delivery user, ordered newest first.
 */
export const getDocumentsByDeliveryUserId = async (
  userId: string
): Promise<DeliveryDocument[]> => {
  const { data, error } = await supabase
    .from('delivery_documents')
    .select('*')
    .eq('delivery_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((doc) => ({
    id: String(doc.id),
    delivery_documents_user_id: String(doc.delivery_user_id),
    document_type: doc.document_type,
    document_url: doc.document_url,
    verification_status: doc.verified ? 'approved' : 'pending',
    expiry_date: doc.expiry_date || undefined,
    notes: doc.notes || undefined,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  })) as DeliveryDocument[];
};

/**
 * Save weekly delivery availability (replaces all for user).
 * Expects array of availability records (without id, user is inferred).
 */
export const saveAvailability = async (
  userId: string,
  availabilities: Array<Omit<DeliveryAvailability, 'id' | 'delivery_user_id' | 'created_at' | 'updated_at'>>
): Promise<DeliveryAvailability[]> => {
  // Remove all old first
  const { error: delError } = await supabase
    .from('delivery_availability')
    .delete()
    .eq('delivery_user_id', userId);
  if (delError) throw new Error(delError.message);

  const now = new Date().toISOString();
  const insertRows = availabilities.map(a => ({
    ...a,
    delivery_user_id: userId,
    created_at: now,
    updated_at: now,
  }));

  const { data, error } = await supabase
    .from('delivery_availability')
    .insert(insertRows)
    .select();

  if (error) throw new Error(error.message);

  return (data || []) as DeliveryAvailability[];
};

/**
 * Get all availability schedules for a user, as array.
 */
export const getAvailabilityByDeliveryUserId = async (
  userId: string
): Promise<DeliveryAvailability[]> => {
  const { data, error } = await supabase
    .from('delivery_availability')
    .select('*')
    .eq('delivery_user_id', userId)
    .order('day_of_week', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as DeliveryAvailability[];
};

/**
 * Save/update delivery user payment details (one row per user, upsert).
 */
export const savePaymentDetails = async (
  userId: string,
  paymentDetails: Omit<DeliveryPaymentDetails, 'id' | 'delivery_payment_details_user_id' | 'created_at' | 'updated_at'>
): Promise<DeliveryPaymentDetails> => {
  const now = new Date().toISOString();
  const upsertData = {
    delivery_payment_details_user_id: userId,
    ...paymentDetails,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('delivery_payment_details')
    .upsert(upsertData, { onConflict: 'delivery_payment_details_user_id' })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Unable to save payment details');
  return data as DeliveryPaymentDetails;
};

/**
 * Get delivery payment details for a user.
 */
export const getPaymentDetailsByDeliveryUserId = async (
  userId: string
): Promise<DeliveryPaymentDetails | null> => {
  const { data, error } = await supabase
    .from('delivery_payment_details')
    .select('*')
    .eq('delivery_payment_details_user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (data as DeliveryPaymentDetails) : null;
};
