
import { supabase } from '@/integrations/supabase/client';
import { DeliveryVehicle } from '@/types/delivery';

// Supabase columns: id, delivery_user_id, vehicle_type, make, model, year, color, license_plate, insurance_number, insurance_expiry, is_active, created_at, updated_at

export const getVehicleByDeliveryUserId = async (
  deliveryUserId: string
): Promise<DeliveryVehicle | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_vehicles')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching vehicle:', error);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      delivery_vehicles_user_id: data.delivery_user_id || '',
      delivery_user_id: data.delivery_user_id || undefined,
      vehicle_type: (data.vehicle_type as DeliveryVehicle['vehicle_type']) || 'car',
      type: (data.vehicle_type as DeliveryVehicle['vehicle_type']) || 'car',
      make: data.make || '',
      model: data.model || '',
      year: typeof data.year === 'number' ? data.year : new Date().getFullYear(),
      color: data.color || '',
      license_plate: data.license_plate || '',
      insurance_policy_number: data.insurance_number || undefined,
      insurance_number: data.insurance_number || undefined,
      insurance_expiry: data.insurance_expiry || undefined,
      registration_number: undefined,
      is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error in getVehicleByDeliveryUserId:', error);
    return null;
  }
};

export const saveVehicleInfo = async (
  vehicleData: Partial<DeliveryVehicle>
): Promise<boolean> => {
  try {
    const { delivery_user_id, delivery_vehicles_user_id, ...updateData } = vehicleData;

    // Use correct user id
    const userId = delivery_vehicles_user_id || delivery_user_id;
    if (!userId) {
      throw new Error('delivery_vehicles_user_id is required');
    }

    // Upsert expects DB columns only, not frontend TS names
    const dbData = {
      delivery_user_id: userId,
      vehicle_type: updateData.vehicle_type || updateData.type || 'car',
      make: updateData.make || '',
      model: updateData.model || '',
      year: typeof updateData.year === 'number' ? updateData.year : new Date().getFullYear(),
      color: updateData.color || '',
      license_plate: updateData.license_plate || '',
      insurance_number: updateData.insurance_policy_number || updateData.insurance_number || undefined,
      insurance_expiry: updateData.insurance_expiry || undefined,
      is_active: typeof updateData.is_active === 'boolean' ? updateData.is_active : true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('delivery_vehicles')
      .upsert(dbData as any, {
        onConflict: 'delivery_user_id',
        ignoreDuplicates: false,
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
