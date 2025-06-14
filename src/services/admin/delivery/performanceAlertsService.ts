
import { supabase } from '@/integrations/supabase/client';
import type { DeliveryPerformanceAlert } from '@/types/admin';

export class PerformanceAlertsService {
  async getPerformanceAlerts(resolved?: boolean): Promise<DeliveryPerformanceAlert[]> {
    try {
      let query = supabase
        .from('delivery_performance_alerts')
        .select(`
          *,
          delivery_users (
            first_name,
            last_name,
            phone,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (resolved !== undefined) {
        query = query.eq('is_resolved', resolved);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching performance alerts:', error);
      return [];
    }
  }

  async createPerformanceAlert(alert: Omit<DeliveryPerformanceAlert, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryPerformanceAlert | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_performance_alerts')
        .insert(alert)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating performance alert:', error);
      return null;
    }
  }

  async resolveAlert(id: string, resolutionNotes: string, resolvedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('delivery_performance_alerts')
        .update({
          is_resolved: true,
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    }
  }

  async updateAlert(id: string, updates: Partial<DeliveryPerformanceAlert>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('delivery_performance_alerts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error updating alert:', error);
      return false;
    }
  }
}

export const performanceAlertsService = new PerformanceAlertsService();
