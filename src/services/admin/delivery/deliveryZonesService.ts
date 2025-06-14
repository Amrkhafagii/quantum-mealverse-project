
import { supabase } from '@/integrations/supabase/client';
import type { DeliveryZone } from '@/types/admin';

export class DeliveryZonesService {
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      return [];
    }
  }

  async createDeliveryZone(zone: Omit<DeliveryZone, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryZone | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .insert(zone)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating delivery zone:', error);
      return null;
    }
  }

  async updateDeliveryZone(id: string, updates: Partial<DeliveryZone>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('delivery_zones')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error updating delivery zone:', error);
      return false;
    }
  }

  async deleteDeliveryZone(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('delivery_zones')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error deleting delivery zone:', error);
      return false;
    }
  }
}

export const deliveryZonesService = new DeliveryZonesService();
