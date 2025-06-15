
// Delivery Onboarding Service - all critical schema-compliant, strictly-typed production functions

import { supabase } from '@/integrations/supabase/client';
import { DeliveryUser, DeliveryDocument, DeliveryAvailability, DeliveryPaymentDetails } from '@/types/delivery';

// --- UTILITY: Only pick allowed fields for DB insert ---
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result: any = {};
  for (const k of keys) {
    if (k in obj) result[k] = obj[k];
  }
  return result;
}

// ========== 1. Create Delivery User ==========
export async function createDeliveryUser(user: Partial<DeliveryUser>): Promise<DeliveryUser> {
  const now = new Date().toISOString();

  // Map to DB schema - only insert allowed fields
  const insertObj = {
    delivery_users_user_id: user.delivery_users_user_id!,
    first_name: user.first_name!,
    last_name: user.last_name!,
    full_name: user.full_name!,
    phone: user.phone!,
    vehicle_type: user.vehicle_type || "",
    license_plate: user.license_plate || "",
    driver_license_number: user.driver_license_number || "",
    status: user.status || "inactive",
    rating: user.rating ?? 0,
    total_deliveries: user.total_deliveries ?? 0,
    verification_status: user.verification_status || "pending",
    background_check_status: user.background_check_status || "pending",
    is_available: user.is_available ?? false,
    is_approved: user.is_approved ?? false,
    last_active: user.last_active || now,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('delivery_users')
    .insert(insertObj)
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Unable to create delivery user');

  // Map DB response to DeliveryUser
  return {
    id: data.id,
    delivery_users_user_id: data.delivery_users_user_id,
    first_name: data.first_name,
    last_name: data.last_name,
    full_name: data.full_name,
    phone: data.phone,
    vehicle_type: data.vehicle_type,
    license_plate: data.license_plate,
    driver_license_number: data.driver_license_number,
    status: data.status,
    rating: data.rating,
    total_deliveries: data.total_deliveries,
    verification_status: data.verification_status,
    background_check_status: data.background_check_status,
    is_available: data.is_available,
    is_approved: data.is_approved,
    last_active: data.last_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

// ========== 2. Upload Delivery Document ==========
export async function uploadDeliveryDocument(
  userId: string,
  file: File,
  documentType: DeliveryDocument["document_type"],
  expiryDate?: string,
  notes?: string
): Promise<DeliveryDocument> {
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${documentType}_${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('delivery-documents')
    .upload(fileName, file);
  if (uploadError) throw new Error(uploadError.message);

  // URL
  const { data: urlData } = supabase.storage
    .from('delivery-documents')
    .getPublicUrl(fileName);

  const document_url = urlData.publicUrl;

  // Insert metadata row
  const { data, error } = await supabase
    .from('delivery_documents')
    .insert({
      delivery_user_id: userId,
      document_type: documentType,
      file_path: fileName,
      document_url,
      expiry_date: expiryDate,
      notes,
      verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
}

// ========== 3. Get Documents for Delivery User ==========
export async function getDocumentsByDeliveryUserId(userId: string): Promise<DeliveryDocument[]> {
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
}

// ========== 4. Save Delivery Availability ==========
export async function saveAvailability(
  userId: string,
  availabilities: Array<Omit<DeliveryAvailability, 'id' | 'delivery_user_id' | 'created_at' | 'updated_at'>>
): Promise<DeliveryAvailability[]> {
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
}

// ========== 5. Get Availability for Delivery User ==========
export async function getAvailabilityByDeliveryUserId(
  userId: string
): Promise<DeliveryAvailability[]> {
  const { data, error } = await supabase
    .from('delivery_availability')
    .select('*')
    .eq('delivery_user_id', userId)
    .order('day_of_week', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as DeliveryAvailability[];
}

// ========== 6. Save/Update Payment Details ==========
export async function savePaymentDetails(
  userId: string,
  details: Omit<DeliveryPaymentDetails, 'id' | 'delivery_payment_details_user_id' | 'created_at' | 'updated_at'>
): Promise<DeliveryPaymentDetails> {
  const now = new Date().toISOString();

  // Upsert Key: delivery_payment_details_user_id (see DB and types)
  const upsertObj = {
    delivery_payment_details_user_id: userId,
    bank_name: details.bank_name,
    account_number: details.account_number,
    routing_number: details.routing_number,
    account_holder_name: details.account_holder_name,
    account_type: details.account_type,
    is_verified: details.is_verified,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('delivery_payment_details')
    .upsert(upsertObj, { onConflict: 'delivery_payment_details_user_id' })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Unable to save payment details');
  return {
    id: data.id,
    delivery_payment_details_user_id: data.delivery_payment_details_user_id,
    bank_name: data.bank_name,
    account_number: data.account_number,
    routing_number: data.routing_number,
    account_holder_name: data.account_holder_name,
    account_type: data.account_type,
    is_verified: !!data.is_verified,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

// ========== 7. Get Payment Details for User ==========
export async function getPaymentDetailsByDeliveryUserId(
  userId: string
): Promise<DeliveryPaymentDetails | null> {
  const { data, error } = await supabase
    .from('delivery_payment_details')
    .select('*')
    .eq('delivery_payment_details_user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    id: data.id,
    delivery_payment_details_user_id: data.delivery_payment_details_user_id,
    bank_name: data.bank_name,
    account_number: data.account_number,
    routing_number: data.routing_number,
    account_holder_name: data.account_holder_name,
    account_type: data.account_type,
    is_verified: !!data.is_verified,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
