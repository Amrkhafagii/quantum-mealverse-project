
import { supabase } from '@/integrations/supabase/client';
import { DeliveryDocument } from '@/types/delivery';

export const getDeliveryDocuments = async (userId: string): Promise<DeliveryDocument[]> => {
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

    return data || [];
  } catch (error) {
    console.error('Error in getDeliveryDocuments:', error);
    return [];
  }
};
