
import { supabase } from '@/integrations/supabase/client';
import { DeliveryVehicle } from '@/types/delivery';

export const getVehicleByDeliveryUserId = async (deliveryUserId: string): Promise<DeliveryVehicle | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_vehicles')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching vehicle:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error in getVehicleByDeliveryUserId:', error);
    return null;
  }
};

export const saveVehicleInfo = async (vehicleData: Partial<DeliveryVehicle>): Promise<boolean> => {
  try {
    const { delivery_user_id, ...updateData } = vehicleData;

    const dbData = {
      delivery_vehicles_user_id: delivery_user_id,
      vehicle_type: updateData.type || updateData.vehicle_type,
      make: updateData.make || '',
      model: updateData.model || '',
      year: updateData.year || new Date().getFullYear(),
      color: updateData.color || '',
      license_plate: updateData.license_plate || '',
      is_active: true,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('delivery_vehicles')
      .upsert(dbData, {
        onConflict: 'delivery_vehicles_user_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error saving vehicle info:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveVehicleInfo:', error);
    return false;
  }
};
