
import { supabase } from '@/integrations/supabase/client';

export class DeliveryLocationTrackingService {
  /**
   * Add a new entry to delivery_location_tracking.
   */
  static async logLocationUpdate({
    assignmentId,
    deliveryUserId,
    latitude,
    longitude,
    timestamp,
    accuracy,
    speed,
    heading,
    batteryLevel,
    networkType,
  }: {
    assignmentId: string;
    deliveryUserId: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy?: number;
    speed?: number;
    heading?: number;
    batteryLevel?: number;
    networkType?: string;
  }) {
    const { error } = await supabase.from('delivery_location_tracking').insert([{
      delivery_assignment_id: assignmentId,
      delivery_user_id: deliveryUserId,
      latitude,
      longitude,
      timestamp,
      accuracy,
      speed,
      heading,
      battery_level: batteryLevel,
      network_type: networkType,
    }]);
    if (error) throw error;
    return true;
  }
}
