
import { supabase } from '@/integrations/supabase/client';
import { DeliveryVehicle } from '@/types/delivery';

// Supabase columns: id, delivery_user_id, vehicle_type, make, model, year, color, license_plate, insurance_number, insurance_expiry, is_active, created_at, updated_at

export const getVehicleByDeliveryUserId = async (
  deliveryUserId: string
): Promise<DeliveryVehicle | null> => {
  try {
    // Use .select('*') for correct Supabase typing
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
      id: typeof data.id === 'string' ? data.id : '',
      delivery_vehicles_user_id: typeof data.delivery_user_id === 'string' ? data.delivery_user_id : '',
      delivery_user_id: typeof data.delivery_user_id === 'string' ? data.delivery_user_id : undefined,
      vehicle_type: 'vehicle_type' in data && typeof data.vehicle_type === 'string' ? data.vehicle_type as DeliveryVehicle['vehicle_type'] : undefined,
      type: 'vehicle_type' in data && typeof data.vehicle_type === 'string' ? data.vehicle_type as DeliveryVehicle['vehicle_type'] : undefined,
      make: typeof data.make === 'string' ? data.make : '',
      model: typeof data.model === 'string' ? data.model : '',
      year: typeof data.year === 'number' ? data.year : new Date().getFullYear(),
      color: typeof data.color === 'string' ? data.color : '',
      license_plate: typeof data.license_plate === 'string' ? data.license_plate : '',
      insurance_policy_number: typeof data.insurance_number === 'string' ? data.insurance_number : undefined,
      insurance_number: typeof data.insurance_number === 'string' ? data.insurance_number : undefined,
      insurance_expiry: typeof data.insurance_expiry === 'string' ? data.insurance_expiry : undefined,
      registration_number: undefined,
      is_active: 'is_active' in data && typeof data.is_active === 'boolean' ? data.is_active : undefined,
      created_at: typeof data.created_at === 'string' ? data.created_at : '',
      updated_at: typeof data.updated_at === 'string' ? data.updated_at : '',
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

