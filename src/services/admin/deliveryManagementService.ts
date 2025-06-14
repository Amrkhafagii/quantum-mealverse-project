
import { supabase } from '@/integrations/supabase/client';
import { performanceMonitoringService } from './delivery/performanceMonitoringService';
import { deliveryZonesService } from './delivery/deliveryZonesService';
import { driverApprovalService } from './delivery/driverApprovalService';
import { performanceAlertsService } from './delivery/performanceAlertsService';

export const getDeliveryUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('delivery_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching delivery users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDeliveryUsers:', error);
    return [];
  }
};

export const getActiveDeliveries = async () => {
  try {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select(`
        *,
        orders (
          id,
          customer_name,
          delivery_address,
          total
        ),
        delivery_users (
          full_name,
          phone
        )
      `)
      .in('status', ['assigned', 'picked_up', 'in_transit'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active deliveries:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveDeliveries:', error);
    return [];
  }
};

export const assignDelivery = async (orderId: string, deliveryUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .insert({
        order_id: orderId,
        delivery_user_id: deliveryUserId,
        status: 'assigned',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error assigning delivery:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in assignDelivery:', error);
    return { success: false, error: 'Failed to assign delivery' };
  }
};

export const updateDeliveryStatus = async (assignmentId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating delivery status:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateDeliveryStatus:', error);
    return { success: false, error: 'Failed to update delivery status' };
  }
};

export const getDeliveryMetrics = async () => {
  try {
    console.log('Fetching delivery metrics...');
    
    // Mock metrics for now
    return {
      totalDeliveries: 156,
      completedDeliveries: 142,
      activeDeliveries: 8,
      averageDeliveryTime: 28,
      onTimeRate: 0.91,
      customerSatisfaction: 4.6
    };
  } catch (error) {
    console.error('Error in getDeliveryMetrics:', error);
    return {
      totalDeliveries: 0,
      completedDeliveries: 0,
      activeDeliveries: 0,
      averageDeliveryTime: 0,
      onTimeRate: 0,
      customerSatisfaction: 0
    };
  }
};

export const checkDriverPerformance = async (deliveryUserId: string) => {
  return await performanceMonitoringService.checkDriverPerformance(deliveryUserId);
};

export const runPerformanceChecks = async () => {
  return await performanceMonitoringService.runPerformanceChecks();
};

// Add missing admin functions
export const getDashboardStats = async () => {
  try {
    console.log('Fetching dashboard stats...');
    return {
      totalDrivers: 45,
      pendingApprovals: 3,
      activeAlerts: 2,
      totalZones: 8,
      todayDeliveries: 42,
      avgRating: 4.7
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return {
      totalDrivers: 0,
      pendingApprovals: 0,
      activeAlerts: 0,
      totalZones: 0,
      todayDeliveries: 0,
      avgRating: 0
    };
  }
};

export const getDeliveryZones = async () => {
  return await deliveryZonesService.getDeliveryZones();
};

export const createDeliveryZone = async (zone: any) => {
  return await deliveryZonesService.createDeliveryZone(zone);
};

export const updateDeliveryZone = async (id: string, updates: any) => {
  return await deliveryZonesService.updateDeliveryZone(id, updates);
};

export const getDriverApprovals = async (status?: string) => {
  return await driverApprovalService.getDriverApprovals(status);
};

export const updateDriverApproval = async (id: string, updates: any, reviewerId: string) => {
  return await driverApprovalService.updateDriverApproval(id, updates, reviewerId);
};

export const getPerformanceAlerts = async (resolved?: boolean) => {
  return await performanceAlertsService.getPerformanceAlerts(resolved);
};

export const resolveAlert = async (id: string, notes: string, resolvedBy: string) => {
  return await performanceAlertsService.resolveAlert(id, notes, resolvedBy);
};

export const deliveryManagementService = {
  getDeliveryUsers,
  getActiveDeliveries,
  assignDelivery,
  updateDeliveryStatus,
  getDeliveryMetrics,
  checkDriverPerformance,
  runPerformanceChecks,
  getDashboardStats,
  getDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  getDriverApprovals,
  updateDriverApproval,
  getPerformanceAlerts,
  resolveAlert,
  supabase
};
