
import { supabase } from '@/integrations/supabase/client';
import { DeliveryDocument } from '@/types/delivery';

// Supabase DB returns fields such as "delivery_user_id", "file_path", "document_type", "verified", etc.
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

    // Map DB fields to DeliveryDocument fields
    return (
      data?.map((doc) => ({
        id: doc.id,
        delivery_documents_user_id: doc.delivery_user_id ?? "", // Map to new naming convention
        document_type: doc.document_type,
        document_url: doc.file_path, // file_path is the URL
        verification_status: doc.verified
          ? 'approved'
          : 'pending', // You can improve this if you have actual status (else fallback)
        expiry_date: doc.expiry_date ?? undefined,
        notes: doc.notes ?? undefined,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      })) ?? []
    );
  } catch (error) {
    console.error('Error in getDeliveryDocuments:', error);
    return [];
  }
};
