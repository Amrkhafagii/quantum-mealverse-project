import { supabase } from '@/integrations/supabase/client';
import type { DeliveryManagementLog } from '@/types/admin';

const ACTIONS: DeliveryManagementLog['action_type'][] = [
  'driver_approved',
  'driver_rejected',
  'driver_suspended',
  'zone_created',
  'zone_updated',
  'alert_resolved',
  'performance_review'
];
const TARGETS: DeliveryManagementLog['target_type'][] = [
  'driver', 'zone', 'alert', 'system'
];

function safeActionType(val: any): DeliveryManagementLog['action_type'] {
  return (ACTIONS as string[]).includes(val) ? val as DeliveryManagementLog['action_type'] : 'system';
}
function safeTargetType(val: any): DeliveryManagementLog['target_type'] {
  return (TARGETS as string[]).includes(val) ? val as DeliveryManagementLog['target_type'] : 'system';
}

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
      return (data || []).map((row: any) => ({
        id: row.id,
        admin_user_id: row.admin_user_id,
        action_type: safeActionType(row.action_type),
        target_type: safeTargetType(row.target_type),
        target_id: row.target_id,
        details: row.details,
        ip_address: row.ip_address,
        user_agent: row.user_agent,
        created_at: row.created_at
      }));
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
      return (data || []).map((row: any) => ({
        id: row.id,
        admin_user_id: row.admin_user_id,
        action_type: safeActionType(row.action_type),
        target_type: safeTargetType(row.target_type),
        target_id: row.target_id,
        details: row.details,
        ip_address: row.ip_address,
        user_agent: row.user_agent,
        created_at: row.created_at
      }));
    } catch (error) {
      console.error('Error fetching logs by date range:', error);
      return [];
    }
  }
}

export const managementLogsService = new ManagementLogsService();
