
import { supabase } from '@/integrations/supabase/client';

export interface DeliveryAddress {
  id?: string;
  user_id: string;
  full_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

export const saveDeliveryAddress = async (address: DeliveryAddress) => {
  try {
    const { data, error } = await supabase
      .from('delivery_addresses')
      .insert({
        delivery_addresses_user_id: address.user_id,
        full_name: address.full_name,
        phone: address.phone,
        email: address.email,
        address: address.address,
        city: address.city,
        latitude: address.latitude,
        longitude: address.longitude,
        is_default: address.is_default || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving delivery address:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in saveDeliveryAddress:', error);
    return { success: false, error: 'Failed to save delivery address' };
  }
};

export const getUserDeliveryAddresses = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('delivery_addresses_user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching delivery addresses:', error);
      return [];
    }

    // Map to our interface format
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.delivery_addresses_user_id,
      full_name: item.full_name,
      phone: item.phone,
      email: item.email,
      address: item.address,
      city: item.city,
      latitude: item.latitude,
      longitude: item.longitude,
      is_default: item.is_default
    }));
  } catch (error) {
    console.error('Error in getUserDeliveryAddresses:', error);
    return [];
  }
};

export const updateDeliveryAddress = async (addressId: string, updates: Partial<DeliveryAddress>) => {
  try {
    const { error } = await supabase
      .from('delivery_addresses')
      .update({
        full_name: updates.full_name,
        phone: updates.phone,
        email: updates.email,
        address: updates.address,
        city: updates.city,
        latitude: updates.latitude,
        longitude: updates.longitude,
        is_default: updates.is_default,
        updated_at: new Date().toISOString()
      })
      .eq('id', addressId);

    if (error) {
      console.error('Error updating delivery address:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateDeliveryAddress:', error);
    return { success: false, error: 'Failed to update delivery address' };
  }
};

export const deleteDeliveryAddress = async (addressId: string) => {
  try {
    const { error } = await supabase
      .from('delivery_addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      console.error('Error deleting delivery address:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteDeliveryAddress:', error);
    return { success: false, error: 'Failed to delete delivery address' };
  }
};

export const setDefaultDeliveryAddress = async (addressId: string, userId: string) => {
  try {
    // First, unset all default addresses for this user
    await supabase
      .from('delivery_addresses')
      .update({ is_default: false })
      .eq('delivery_addresses_user_id', userId);

    // Then set the specified address as default
    const { error } = await supabase
      .from('delivery_addresses')
      .update({ is_default: true })
      .eq('id', addressId);

    if (error) {
      console.error('Error setting default delivery address:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in setDefaultDeliveryAddress:', error);
    return { success: false, error: 'Failed to set default delivery address' };
  }
};

export const deliveryService = {
  saveDeliveryAddress,
  getUserDeliveryAddresses,
  updateDeliveryAddress,
  deleteDeliveryAddress,
  setDefaultDeliveryAddress
};
