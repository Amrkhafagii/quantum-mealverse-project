
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeliveryInfo {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Streamlined function to save or update delivery information
 * Automatically decides whether to insert or update based on existing data
 * @param deliveryInfo - The delivery information to save
 * @returns Promise with success status and optional error message
 */
export const saveDeliveryInfo = async (deliveryInfo: DeliveryInfo): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Saving delivery info for user ${deliveryInfo.user_id}`);
    
    // Check if delivery info already exists
    const { data: existingInfo, error: checkError } = await supabase
      .from('delivery_addresses')
      .select('id')
      .eq('user_id', deliveryInfo.user_id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing delivery info:', checkError);
      throw new Error(`Failed to check existing delivery info: ${checkError.message}`);
    }

    const hasExistingInfo = Boolean(existingInfo);
    console.log(`User ${deliveryInfo.user_id} ${hasExistingInfo ? 'has existing' : 'needs new'} delivery info`);

    if (hasExistingInfo) {
      // Update existing delivery information
      const { error: updateError } = await supabase
        .from('delivery_addresses')
        .update({
          full_name: deliveryInfo.full_name,
          email: deliveryInfo.email,
          phone: deliveryInfo.phone,
          address: deliveryInfo.address,
          city: deliveryInfo.city,
          latitude: deliveryInfo.latitude,
          longitude: deliveryInfo.longitude,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', deliveryInfo.user_id);

      if (updateError) {
        console.error('Error updating delivery info:', updateError);
        throw new Error(`Failed to update delivery info: ${updateError.message}`);
      }

      console.log(`Successfully updated delivery info for user ${deliveryInfo.user_id}`);
    } else {
      // Insert new delivery information
      const { error: insertError } = await supabase
        .from('delivery_addresses')
        .insert({
          user_id: deliveryInfo.user_id,
          full_name: deliveryInfo.full_name,
          email: deliveryInfo.email,
          phone: deliveryInfo.phone,
          address: deliveryInfo.address,
          city: deliveryInfo.city,
          latitude: deliveryInfo.latitude,
          longitude: deliveryInfo.longitude
        });

      if (insertError) {
        console.error('Error inserting delivery info:', insertError);
        throw new Error(`Failed to save delivery info: ${insertError.message}`);
      }

      console.log(`Successfully saved new delivery info for user ${deliveryInfo.user_id}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Critical error in saveDeliveryInfo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Retrieves delivery information for a user
 * @param userId - The user ID
 * @returns Promise with delivery info or null if not found
 */
export const getDeliveryInfo = async (userId: string): Promise<DeliveryInfo | null> => {
  try {
    console.log(`Fetching delivery info for user ${userId}`);
    
    const { data, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching delivery info:', error);
      throw error;
    }

    if (!data) {
      console.log(`No delivery info found for user ${userId}`);
      return null;
    }

    console.log(`Successfully retrieved delivery info for user ${userId}`);
    return {
      user_id: data.user_id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch (error) {
    console.error('Error getting delivery info:', error);
    return null;
  }
};
