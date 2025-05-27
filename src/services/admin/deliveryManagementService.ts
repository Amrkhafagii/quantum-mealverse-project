import { supabase } from '@/integrations/supabase/client';
import type { 
  DeliveryZone, 
  DriverApprovalWorkflow, 
  DeliveryPerformanceAlert, 
  DeliveryManagementLog,
  AdminDashboardStats 
} from '@/types/admin';

class DeliveryManagementService {
  public supabase = supabase;

  // Dashboard Stats
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [driversCount, pendingApprovals, activeAlerts, zonesCount, todayDeliveries, avgRating] = await Promise.all([
      this.getTotalDriversCount(),
      this.getPendingApprovalsCount(),
      this.getActiveAlertsCount(),
      this.getTotalZonesCount(),
      this.getTodayDeliveriesCount(),
      this.getAverageRating()
    ]);

    return {
      totalDrivers: driversCount,
      pendingApprovals: pendingApprovals,
      activeAlerts: activeAlerts,
      totalZones: zonesCount,
      todayDeliveries: todayDeliveries,
      avgRating: avgRating
    };
  }

  private async getTotalDriversCount(): Promise<number> {
    const { count } = await supabase
      .from('delivery_users')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }

  private async getPendingApprovalsCount(): Promise<number> {
    const { count } = await supabase
      .from('driver_approval_workflow')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    return count || 0;
  }

  private async getActiveAlertsCount(): Promise<number> {
    const { count } = await supabase
      .from('delivery_performance_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('is_resolved', false);
    return count || 0;
  }

  private async getTotalZonesCount(): Promise<number> {
    const { count } = await supabase
      .from('delivery_zones')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    return count || 0;
  }

  private async getTodayDeliveriesCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('delivery_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered')
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`);
    return count || 0;
  }

  private async getAverageRating(): Promise<number> {
    const { data } = await supabase
      .from('delivery_users')
      .select('average_rating');
    
    if (!data || data.length === 0) return 0;
    
    const totalRating = data.reduce((sum, user) => sum + (user.average_rating || 0), 0);
    return Number((totalRating / data.length).toFixed(1));
  }

  // Delivery Zones Management
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .order('priority_level', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createDeliveryZone(zone: Omit<DeliveryZone, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryZone | null> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .insert(zone)
      .select()
      .single();

    if (error) throw error;
    
    if (data) {
      await this.logAdminAction('zone_created', 'zone', data.id, { zone_name: zone.name });
    }
    
    return data;
  }

  async updateDeliveryZone(id: string, updates: Partial<DeliveryZone>): Promise<DeliveryZone | null> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    if (data) {
      await this.logAdminAction('zone_updated', 'zone', id, updates);
    }
    
    return data;
  }

  async deleteDeliveryZone(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('delivery_zones')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Driver Approval Workflow
  async getDriverApprovals(status?: string): Promise<DriverApprovalWorkflow[]> {
    let query = supabase
      .from('driver_approval_workflow')
      .select(`
        *,
        delivery_users:delivery_user_id (
          first_name,
          last_name,
          phone,
          user_id
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Cast the response to proper types
    return (data || []).map(item => ({
      ...item,
      status: item.status as DriverApprovalWorkflow['status'],
      stage: item.stage as DriverApprovalWorkflow['stage']
    }));
  }

  async updateDriverApproval(
    id: string, 
    updates: {
      status?: string;
      stage?: string;
      review_notes?: string;
      rejection_reason?: string;
    },
    adminUserId: string
  ): Promise<DriverApprovalWorkflow | null> {
    const updateData: any = {
      ...updates,
      reviewer_id: adminUserId,
      updated_at: new Date().toISOString()
    };

    if (updates.status === 'approved') {
      updateData.approval_date = new Date().toISOString();
    } else if (updates.status === 'rejected') {
      updateData.rejection_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('driver_approval_workflow')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    if (data) {
      const actionType = updates.status === 'approved' ? 'driver_approved' : 
                        updates.status === 'rejected' ? 'driver_rejected' : 
                        updates.status === 'suspended' ? 'driver_suspended' : 'performance_review';
      
      await this.logAdminAction(actionType, 'driver', data.delivery_user_id, updates);
      
      // Update delivery user approval status
      if (updates.status === 'approved') {
        await supabase
          .from('delivery_users')
          .update({ is_approved: true })
          .eq('id', data.delivery_user_id);
      }
    }
    
    // Cast the response to proper type
    return data ? {
      ...data,
      status: data.status as DriverApprovalWorkflow['status'],
      stage: data.stage as DriverApprovalWorkflow['stage']
    } : null;
  }

  // Performance Alerts Management
  async getPerformanceAlerts(resolved?: boolean): Promise<DeliveryPerformanceAlert[]> {
    let query = supabase
      .from('delivery_performance_alerts')
      .select(`
        *,
        delivery_users:delivery_user_id (
          first_name,
          last_name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (typeof resolved === 'boolean') {
      query = query.eq('is_resolved', resolved);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Cast the response to proper types
    return (data || []).map(item => ({
      ...item,
      alert_type: item.alert_type as DeliveryPerformanceAlert['alert_type'],
      severity: item.severity as DeliveryPerformanceAlert['severity']
    }));
  }

  async resolveAlert(
    id: string, 
    resolution_notes: string, 
    adminUserId: string
  ): Promise<DeliveryPerformanceAlert | null> {
    const { data, error } = await supabase
      .from('delivery_performance_alerts')
      .update({
        is_resolved: true,
        resolved_by: adminUserId,
        resolved_at: new Date().toISOString(),
        resolution_notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    if (data) {
      await this.logAdminAction('alert_resolved', 'alert', id, { resolution_notes });
    }
    
    // Cast the response to proper type
    return data ? {
      ...data,
      alert_type: data.alert_type as DeliveryPerformanceAlert['alert_type'],
      severity: data.severity as DeliveryPerformanceAlert['severity']
    } : null;
  }

  async createPerformanceAlert(
    deliveryUserId: string,
    alertType: string,
    severity: string,
    title: string,
    description: string,
    thresholdValue?: number,
    actualValue?: number
  ): Promise<string | null> {
    const { data } = await supabase.rpc('generate_performance_alert', {
      p_delivery_user_id: deliveryUserId,
      p_alert_type: alertType,
      p_severity: severity,
      p_title: title,
      p_description: description,
      p_threshold_value: thresholdValue,
      p_actual_value: actualValue
    });

    return data;
  }

  // Management Logs
  async getManagementLogs(limit = 50): Promise<DeliveryManagementLog[]> {
    const { data, error } = await supabase
      .from('delivery_management_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Cast the response to proper types
    return (data || []).map(item => ({
      ...item,
      action_type: item.action_type as DeliveryManagementLog['action_type'],
      target_type: item.target_type as DeliveryManagementLog['target_type']
    }));
  }

  private async logAdminAction(
    actionType: string,
    targetType: string,
    targetId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc('log_admin_action', {
      p_admin_user_id: user.id,
      p_action_type: actionType,
      p_target_type: targetType,
      p_target_id: targetId,
      p_details: details
    });
  }

  // Performance monitoring functions
  async monitorDriverPerformance(): Promise<void> {
    // Check for low ratings
    const { data: lowRatedDrivers } = await supabase
      .from('delivery_users')
      .select('id, first_name, last_name, average_rating')
      .lt('average_rating', 3.5)
      .gt('total_deliveries', 10);

    if (lowRatedDrivers) {
      for (const driver of lowRatedDrivers) {
        await this.createPerformanceAlert(
          driver.id,
          'low_rating',
          'high',
          'Low Average Rating',
          `Driver ${driver.first_name} ${driver.last_name} has a low average rating of ${driver.average_rating}`,
          3.5,
          driver.average_rating
        );
      }
    }

    // Check for high cancellation rates
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: cancellationData } = await supabase
      .from('delivery_assignments')
      .select('delivery_user_id')
      .eq('status', 'cancelled')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (cancellationData) {
      const cancellationCounts = cancellationData.reduce((acc: Record<string, number>, curr) => {
        if (curr.delivery_user_id) {
          acc[curr.delivery_user_id] = (acc[curr.delivery_user_id] || 0) + 1;
        }
        return acc;
      }, {});

      for (const [driverId, count] of Object.entries(cancellationCounts)) {
        if (count >= 5) {
          const { data: driver } = await supabase
            .from('delivery_users')
            .select('first_name, last_name')
            .eq('id', driverId)
            .single();

          if (driver) {
            await this.createPerformanceAlert(
              driverId,
              'high_cancellation',
              'medium',
              'High Cancellation Rate',
              `Driver ${driver.first_name} ${driver.last_name} has cancelled ${count} deliveries in the last 7 days`,
              5,
              count
            );
          }
        }
      }
    }
  }
}

export const deliveryManagementService = new DeliveryManagementService();
