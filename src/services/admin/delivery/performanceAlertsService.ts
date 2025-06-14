import { supabase } from '@/integrations/supabase/client';
import type { DeliveryPerformanceAlert } from '@/types/admin';

const ALERT_TYPES = [
  'low_rating',
  'high_cancellation',
  'late_delivery',
  'customer_complaint',
  'policy_violation'
] as const;
const SEVERITIES = [
  'low',
  'medium',
  'high',
  'critical'
] as const;

function safeAlertType(val: any): DeliveryPerformanceAlert['alert_type'] {
  return (ALERT_TYPES as readonly string[]).includes(val) ? val : 'policy_violation';
}
function safeSeverity(val: any): DeliveryPerformanceAlert['severity'] {
  return (SEVERITIES as readonly string[]).includes(val) ? val as any : 'medium';
}

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

      return (data || []).map((row: any) => ({
        id: row.id,
        delivery_user_id: row.delivery_user_id,
        alert_type: safeAlertType(row.alert_type),
        severity: safeSeverity(row.severity),
        title: row.title,
        description: row.description,
        threshold_value: row.threshold_value,
        actual_value: row.actual_value,
        is_resolved: !!row.is_resolved,
        resolved_by: row.resolved_by,
        resolved_at: row.resolved_at,
        resolution_notes: row.resolution_notes,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
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

      return ({
        ...data,
        alert_type: safeAlertType(data.alert_type),
        severity: safeSeverity(data.severity),
        is_resolved: !!data.is_resolved
      });
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
