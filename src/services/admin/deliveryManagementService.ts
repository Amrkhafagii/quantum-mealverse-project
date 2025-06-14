
import { supabase } from '@/integrations/supabase/client';

// Import all the specialized services
import { dashboardStatsService } from './delivery/dashboardStatsService';
import { deliveryZonesService } from './delivery/deliveryZonesService';
import { driverApprovalService } from './delivery/driverApprovalService';
import { performanceAlertsService } from './delivery/performanceAlertsService';
import { managementLogsService } from './delivery/managementLogsService';
import { performanceMonitoringService } from './delivery/performanceMonitoringService';

import type { 
  DeliveryZone, 
  DriverApprovalWorkflow, 
  DeliveryPerformanceAlert, 
  DeliveryManagementLog,
  AdminDashboardStats 
} from '@/types/admin';

/**
 * Main delivery management service that acts as a facade for all delivery admin operations.
 * This service delegates to specialized services for better code organization.
 */
class DeliveryManagementService {
  // Expose supabase client for hooks that need it
  public supabase = supabase;

  // Dashboard Stats Methods
  async getDashboardStats(): Promise<AdminDashboardStats> {
    return dashboardStatsService.getDashboardStats();
  }

  // Delivery Zones Methods
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    return deliveryZonesService.getDeliveryZones();
  }

  async createDeliveryZone(zone: Omit<DeliveryZone, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryZone | null> {
    return deliveryZonesService.createDeliveryZone(zone);
  }

  async updateDeliveryZone(id: string, updates: Partial<DeliveryZone>): Promise<boolean> {
    return deliveryZonesService.updateDeliveryZone(id, updates);
  }

  async deleteDeliveryZone(id: string): Promise<boolean> {
    return deliveryZonesService.deleteDeliveryZone(id);
  }

  // Driver Approval Methods
  async getDriverApprovals(status?: string): Promise<DriverApprovalWorkflow[]> {
    return driverApprovalService.getDriverApprovals(status);
  }

  async updateDriverApproval(
    id: string, 
    updates: Partial<DriverApprovalWorkflow>, 
    reviewerId: string
  ): Promise<boolean> {
    return driverApprovalService.updateDriverApproval(id, updates, reviewerId);
  }

  async createDriverApproval(deliveryUserId: string): Promise<DriverApprovalWorkflow | null> {
    return driverApprovalService.createDriverApproval(deliveryUserId);
  }

  // Performance Alerts Methods
  async getPerformanceAlerts(resolved?: boolean): Promise<DeliveryPerformanceAlert[]> {
    return performanceAlertsService.getPerformanceAlerts(resolved);
  }

  async createPerformanceAlert(alert: Omit<DeliveryPerformanceAlert, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryPerformanceAlert | null> {
    return performanceAlertsService.createPerformanceAlert(alert);
  }

  async resolveAlert(id: string, resolutionNotes: string, resolvedBy: string): Promise<boolean> {
    return performanceAlertsService.resolveAlert(id, resolutionNotes, resolvedBy);
  }

  async updateAlert(id: string, updates: Partial<DeliveryPerformanceAlert>): Promise<boolean> {
    return performanceAlertsService.updateAlert(id, updates);
  }

  // Management Logs Methods
  async createLog(
    adminUserId: string,
    actionType: DeliveryManagementLog['action_type'],
    targetType: DeliveryManagementLog['target_type'],
    targetId?: string,
    details?: Record<string, any>,
    request?: Request
  ): Promise<boolean> {
    return managementLogsService.createLog(adminUserId, actionType, targetType, targetId, details, request);
  }

  async getLogs(
    adminUserId?: string,
    actionType?: string,
    targetType?: string,
    limit: number = 100
  ): Promise<DeliveryManagementLog[]> {
    return managementLogsService.getLogs(adminUserId, actionType, targetType, limit);
  }

  async getLogsByDateRange(
    startDate: string,
    endDate: string,
    adminUserId?: string
  ): Promise<DeliveryManagementLog[]> {
    return managementLogsService.getLogsByDateRange(startDate, endDate, adminUserId);
  }

  // Performance Monitoring Methods
  async checkDriverPerformance(deliveryUserId: string): Promise<void> {
    return performanceMonitoringService.checkDriverPerformance(deliveryUserId);
  }

  async runPerformanceChecks(): Promise<void> {
    return performanceMonitoringService.runPerformanceChecks();
  }
}

export const deliveryManagementService = new DeliveryManagementService();
