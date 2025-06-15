import { supabase } from '@/integrations/supabase/client';
import { DeliveryUser, DeliveryAvailability, DeliveryDocument, DeliveryPaymentDetails } from '@/types/delivery';

/**
 * Create a new delivery user profile.
 */
export const createDeliveryUser = async (userData: Partial<DeliveryUser>): Promise<DeliveryUser> => {
  const now = new Date().toISOString();
  const insertData: any = {
    ...userData,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('delivery_users')
    .insert(insertData)
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Unable to create delivery user');

  // Correctly map fields as per DeliveryUser interface, with fallback for optional fields
  return {
    id: String(data.id),
    delivery_users_user_id: String(data.delivery_users_user_id),
    full_name: data.full_name ?? [data.first_name, data.last_name].filter(Boolean).join(' '),
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone ?? '',
    vehicle_type: data.vehicle_type ?? '',
    license_plate: data.license_plate ?? '',
    driver_license_number: data.driver_license_number ?? '',
    status: ['active', 'inactive', 'suspended', 'on_break'].includes(data.status) ? data.status : 'inactive',
    rating: typeof data.rating === 'number'
      ? data.rating
      : typeof data.average_rating === 'number'
      ? data.average_rating
      : 0,
    total_deliveries: typeof data.total_deliveries === 'number' ? data.total_deliveries : 0,
    verification_status: ['pending', 'verified', 'rejected'].includes(data.verification_status)
      ? data.verification_status
      : 'pending',
    background_check_status: ['pending', 'approved', 'rejected'].includes(data.background_check_status)
      ? data.background_check_status
      : 'pending',
    is_available: !!(data.is_available ?? false),
    is_approved: !!(data.is_approved ?? false),
    last_active: data.last_active ?? '',
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

// Helper for type guards for DeliveryDocument
const validDocTypes = [
  "license",
  "insurance",
  "registration",
  "background_check",
  "profile_photo",
  "drivers_license",
  "vehicle_registration",
  "identity",
] as const;
function isValidDocType(type: any): type is DeliveryDocument["document_type"] {
  return validDocTypes.includes(type);
}

/**
 * Upload a delivery document file and record in the DB.
 */
export const uploadDeliveryDocument = async (
  userId: string,
  file: File,
  documentType: DeliveryDocument["document_type"],
  expiryDate?: string,
  notes?: string
): Promise<DeliveryDocument> => {
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${documentType}_${Date.now()}.${ext}`;
  const uploadResult = await supabase.storage
    .from('delivery-documents')
    .upload(fileName, file);

  if (uploadResult.error) throw new Error(uploadResult.error.message);

  // Correctly retrieve public URL from .data.publicUrl
  const { data: urlData } = supabase.storage
    .from('delivery-documents')
    .getPublicUrl(fileName);

  const publicUrl = urlData && 'publicUrl' in urlData ? urlData.publicUrl : '';

  // Insert file record with correct DB field names
  const { data, error } = await supabase
    .from('delivery_documents')
    .insert({
      delivery_user_id: userId,
      document_type: documentType,
      file_path: fileName,
      // document_url in DB may not exist; only store file_path and use publicUrl in UI (optional)
      expiry_date: expiryDate,
      notes,
      verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Unable to save delivery document');

  // Return value matches DeliveryDocument, for UI list display
  return {
    id: String(data.id),
    delivery_documents_user_id: String(data.delivery_user_id),
    document_type: data.document_type,
    document_url: publicUrl,
    verification_status: data.verified ? 'approved' : 'pending',
    expiry_date: data.expiry_date || undefined,
    notes: data.notes || undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Get all documents for a delivery user.
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

  return (data || []).map((doc) => {
    const { data: urlData } = supabase.storage
      .from('delivery-documents')
      .getPublicUrl(doc.file_path || '');
    const publicUrl = urlData && 'publicUrl' in urlData ? urlData.publicUrl : '';
    return {
      id: String(doc.id),
      delivery_documents_user_id: String(doc.delivery_user_id),
      document_type: doc.document_type,
      document_url: publicUrl,
      verification_status: doc.verified ? 'approved' : 'pending',
      expiry_date: doc.expiry_date || undefined,
      notes: doc.notes || undefined,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  });
};

/**
 * Save weekly delivery availability (replaces all for user).
 */
export const saveAvailability = async (
  userId: string,
  availabilities: Array<Omit<DeliveryAvailability, 'id' | 'delivery_user_id' | 'created_at' | 'updated_at'>>
): Promise<DeliveryAvailability[]> => {
  // Remove all old entries for this user
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
 * Get all availability schedules for a user.
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
 * Save/update delivery user payment details (upsert, one row per user).
 */
export const savePaymentDetails = async (
  userId: string,
  paymentDetails: Omit<DeliveryPaymentDetails, 'id' | 'delivery_payment_details_user_id' | 'created_at' | 'updated_at'>
): Promise<DeliveryPaymentDetails> => {
  const now = new Date().toISOString();
  const upsertData = {
    delivery_payment_details_user_id: userId,
    bank_name: paymentDetails.bank_name,
    account_number: paymentDetails.account_number,
    routing_number: paymentDetails.routing_number,
    account_holder_name: paymentDetails.account_holder_name,
    account_type: paymentDetails.account_type,
    is_verified: !!paymentDetails.is_verified,
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabase
    .from('delivery_payment_details')
    .upsert(upsertData, { onConflict: 'delivery_payment_details_user_id' })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Unable to save payment details');
  return {
    id: String(data.id),
    delivery_payment_details_user_id: String(data.delivery_payment_details_user_id),
    bank_name: data.bank_name,
    account_number: data.account_number,
    routing_number: data.routing_number,
    account_holder_name: data.account_holder_name,
    account_type: data.account_type,
    is_verified: data.is_verified,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
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
  if (!data) return null;
  return {
    id: String(data.id),
    delivery_payment_details_user_id: String(data.delivery_payment_details_user_id),
    bank_name: data.bank_name,
    account_number: data.account_number,
    routing_number: data.routing_number,
    account_holder_name: data.account_holder_name,
    account_type: data.account_type,
    is_verified: data.is_verified,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};
