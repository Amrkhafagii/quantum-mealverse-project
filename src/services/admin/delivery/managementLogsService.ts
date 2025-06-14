
import { supabase } from '@/integrations/supabase/client';
import type { DeliveryManagementLog } from '@/types/admin';

export class ManagementLogsService {
  async createLog(
    adminUserId: string,
    actionType: DeliveryManagementLog['action_type'],
    targetType: DeliveryManagementLog['target_type'],
    targetId?: string,
    details?: Record<string, any>,
    request?: Request
  ): Promise<boolean> {
    try {
      const logData: Omit<DeliveryManagementLog, 'id' | 'created_at'> = {
        admin_user_id: adminUserId,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        details: details,
        ip_address: request?.headers.get('x-forwarded-for') || 
                   request?.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request?.headers.get('user-agent') || 'unknown'
      };

      const { error } = await supabase
        .from('delivery_management_logs')
        .insert(logData);

      return !error;
    } catch (error) {
      console.error('Error creating management log:', error);
      return false;
    }
  }

  async getLogs(
    adminUserId?: string,
    actionType?: string,
    targetType?: string,
    limit: number = 100
  ): Promise<DeliveryManagementLog[]> {
    try {
      let query = supabase
        .from('delivery_management_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (adminUserId) {
        query = query.eq('admin_user_id', adminUserId);
      }
      if (actionType) {
        query = query.eq('action_type', actionType);
      }
      if (targetType) {
        query = query.eq('target_type', targetType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching management logs:', error);
      return [];
    }
  }

  async getLogsByDateRange(
    startDate: string,
    endDate: string,
    adminUserId?: string
  ): Promise<DeliveryManagementLog[]> {
    try {
      let query = supabase
        .from('delivery_management_logs')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (adminUserId) {
        query = query.eq('admin_user_id', adminUserId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching logs by date range:', error);
      return [];
    }
  }
}

export const managementLogsService = new ManagementLogsService();
