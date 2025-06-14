
import { supabase } from '@/integrations/supabase/client';
import { DeliveryDocument } from '@/types/delivery';

// Only allow these for the typescript DeliveryDocument type
const allowedDocTypes = [
  "license",
  "insurance",
  "registration",
  "background_check",
  "profile_photo",
  "drivers_license",
  "vehicle_registration",
  "identity",
] as const;

function isValidDocumentType(type: string): type is DeliveryDocument["document_type"] {
  return allowedDocTypes.includes(type as DeliveryDocument["document_type"]);
}

export const getDeliveryDocuments = async (
  userId: string
): Promise<DeliveryDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('delivery_documents')
      .select('*')
      .eq('delivery_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching delivery documents:', error);
      return [];
    }

    // Map DB fields to DeliveryDocument fields and filter for allowed document_type only
    return (
      data
        ? data
            .filter(
              (doc) =>
                !!doc.document_type &&
                isValidDocumentType(doc.document_type)
            )
            .map(
              (doc): DeliveryDocument => ({
                id: String(doc.id),
                delivery_documents_user_id: String(doc.delivery_user_id) ?? "",
                document_type: doc.document_type as DeliveryDocument["document_type"],
                document_url: String(doc.file_path),
                verification_status: doc.verified
                  ? "approved"
                  : "pending", // No rejected in DB model here
                expiry_date: doc.expiry_date || undefined,
                notes: doc.notes || undefined,
                created_at: doc.created_at,
                updated_at: doc.updated_at,
              })
            )
        : []
    );
  } catch (error) {
    console.error('Error in getDeliveryDocuments:', error);
    return [];
  }
};
