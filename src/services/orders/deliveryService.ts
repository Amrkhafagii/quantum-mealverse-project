
import { supabase } from '@/integrations/supabase/client';

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
 * Saves or updates delivery information in the database
 * @param deliveryInfo - The delivery information to save
 * @returns Promise with success status and optional error message
 */
export const saveDeliveryInfo = async (deliveryInfo: DeliveryInfo): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Saving delivery info for user ${deliveryInfo.user_id}`);
    
    // Check if user already has a delivery address
    const { data: existingAddress, error: fetchError } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', deliveryInfo.user_id)
      .eq('is_default', true)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing delivery address:', fetchError);
      return { 
        success: false, 
        error: 'Failed to check existing delivery information' 
      };
    }

    let result;
    if (existingAddress) {
      // Update existing address
      result = await supabase
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
        .eq('id', existingAddress.id);
    } else {
      // Create new address
      result = await supabase
        .from('delivery_addresses')
        .insert({
          user_id: deliveryInfo.user_id,
          full_name: deliveryInfo.full_name,
          email: deliveryInfo.email,
          phone: deliveryInfo.phone,
          address: deliveryInfo.address,
          city: deliveryInfo.city,
          latitude: deliveryInfo.latitude,
          longitude: deliveryInfo.longitude,
          is_default: true
        });
    }

    if (result.error) {
      console.error('Error saving delivery info:', result.error);
      return { 
        success: false, 
        error: 'Failed to save delivery information' 
      };
    }

    console.log(`Successfully saved delivery info for user ${deliveryInfo.user_id}`);
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
 * Retrieves delivery information for a user from the database
 * @param userId - The user ID
 * @returns Promise with delivery info or null if not found
 */
export const getDeliveryInfo = async (userId: string): Promise<DeliveryInfo | null> => {
  try {
    console.log(`Fetching delivery info for user ${userId}`);
    
    const { data: deliveryAddress, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        console.log(`No delivery info found for user ${userId}`);
        return null;
      }
      console.error('Error fetching delivery info:', error);
      return null;
    }

    if (!deliveryAddress) {
      console.log(`No delivery info found for user ${userId}`);
      return null;
    }

    console.log(`Successfully retrieved delivery info for user ${userId}`);
    
    return {
      user_id: deliveryAddress.user_id,
      full_name: deliveryAddress.full_name,
      email: deliveryAddress.email || '',
      phone: deliveryAddress.phone,
      address: deliveryAddress.address,
      city: deliveryAddress.city,
      latitude: deliveryAddress.latitude,
      longitude: deliveryAddress.longitude
    };
  } catch (error) {
    console.error('Error getting delivery info:', error);
    return null;
  }
};
