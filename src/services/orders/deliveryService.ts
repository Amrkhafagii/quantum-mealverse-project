
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
 * Streamlined function to save or update delivery information
 * Uses the orders table to store delivery info as we don't have a dedicated delivery_addresses table
 * @param deliveryInfo - The delivery information to save
 * @returns Promise with success status and optional error message
 */
export const saveDeliveryInfo = async (deliveryInfo: DeliveryInfo): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Saving delivery info for user ${deliveryInfo.user_id}`);
    
    // For now, we'll store this in localStorage since we don't have the delivery_addresses table
    // In a real implementation, you would create the delivery_addresses table first
    const storageKey = `delivery_info_${deliveryInfo.user_id}`;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        ...deliveryInfo,
        updated_at: new Date().toISOString()
      }));
      console.log(`Successfully saved delivery info for user ${deliveryInfo.user_id} to localStorage`);
      return { success: true };
    } catch (storageError) {
      console.error('Error saving to localStorage:', storageError);
      return { 
        success: false, 
        error: 'Failed to save delivery information locally' 
      };
    }

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
 * Uses localStorage since we don't have the delivery_addresses table
 * @param userId - The user ID
 * @returns Promise with delivery info or null if not found
 */
export const getDeliveryInfo = async (userId: string): Promise<DeliveryInfo | null> => {
  try {
    console.log(`Fetching delivery info for user ${userId}`);
    
    const storageKey = `delivery_info_${userId}`;
    const storedInfo = localStorage.getItem(storageKey);
    
    if (!storedInfo) {
      console.log(`No delivery info found for user ${userId}`);
      return null;
    }

    const deliveryInfo = JSON.parse(storedInfo);
    console.log(`Successfully retrieved delivery info for user ${userId}`);
    
    return {
      user_id: deliveryInfo.user_id,
      full_name: deliveryInfo.full_name,
      email: deliveryInfo.email,
      phone: deliveryInfo.phone,
      address: deliveryInfo.address,
      city: deliveryInfo.city,
      latitude: deliveryInfo.latitude,
      longitude: deliveryInfo.longitude
    };
  } catch (error) {
    console.error('Error getting delivery info:', error);
    return null;
  }
};
