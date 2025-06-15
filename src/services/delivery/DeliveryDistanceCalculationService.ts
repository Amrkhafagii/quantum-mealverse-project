
import { supabase } from '@/integrations/supabase/client';

export class DeliveryDistanceCalculationService {
  /**
   * Calculate Haversine distance (km) between two geo points using DB.
   * This must use the PostGIS-native SQL function for accuracy.
   */
  static async calculateDistanceKm(
    lat1: number, lng1: number, lat2: number, lng2: number
  ): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_delivery_distance', {
      lat1,
      lng1,
      lat2,
      lng2,
    });
    if (error) throw error;
    return data as number;
  }
}
