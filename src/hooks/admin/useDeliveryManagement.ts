
import { useState, useEffect } from 'react';
import { deliveryManagementService } from '@/services/admin/deliveryManagementService';
import type { 
  DeliveryZone, 
  DriverApprovalWorkflow, 
  DeliveryPerformanceAlert, 
  AdminDashboardStats 
} from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

export const useDeliveryManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [approvals, setApprovals] = useState<DriverApprovalWorkflow[]>([]);
  const [alerts, setAlerts] = useState<DeliveryPerformanceAlert[]>([]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await deliveryManagementService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryZones = async () => {
    try {
      setLoading(true);
      const zonesData = await deliveryManagementService.getDeliveryZones();
      setZones(zonesData);
    } catch (error) {
      console.error('Error loading delivery zones:', error);
      toast({
        title: 'Error',
        description: 'Failed to load delivery zones',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDriverApprovals = async (status?: string) => {
    try {
      setLoading(true);
      const approvalsData = await deliveryManagementService.getDriverApprovals(status);
      setApprovals(approvalsData);
    } catch (error) {
      console.error('Error loading driver approvals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load driver approvals',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceAlerts = async (resolved?: boolean) => {
    try {
      setLoading(true);
      const alertsData = await deliveryManagementService.getPerformanceAlerts(resolved);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading performance alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load performance alerts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const approveDriver = async (id: string, notes?: string) => {
    try {
      const { data: { user } } = await deliveryManagementService.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await deliveryManagementService.updateDriverApproval(
        id,
        { status: 'approved', review_notes: notes },
        user.id
      );
      
      toast({
        title: 'Success',
        description: 'Driver approved successfully'
      });
      
      await loadDriverApprovals();
    } catch (error) {
      console.error('Error approving driver:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve driver',
        variant: 'destructive'
      });
    }
  };

  const rejectDriver = async (id: string, reason: string) => {
    try {
      const { data: { user } } = await deliveryManagementService.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await deliveryManagementService.updateDriverApproval(
        id,
        { status: 'rejected', rejection_reason: reason },
        user.id
      );
      
      toast({
        title: 'Success',
        description: 'Driver rejected successfully'
      });
      
      await loadDriverApprovals();
    } catch (error) {
      console.error('Error rejecting driver:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject driver',
        variant: 'destructive'
      });
    }
  };

  const resolveAlert = async (id: string, notes: string) => {
    try {
      const { data: { user } } = await deliveryManagementService.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await deliveryManagementService.resolveAlert(id, notes, user.id);
      
      toast({
        title: 'Success',
        description: 'Alert resolved successfully'
      });
      
      await loadPerformanceAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve alert',
        variant: 'destructive'
      });
    }
  };

  const createZone = async (zone: Omit<DeliveryZone, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await deliveryManagementService.createDeliveryZone(zone);
      
      toast({
        title: 'Success',
        description: 'Delivery zone created successfully'
      });
      
      await loadDeliveryZones();
    } catch (error) {
      console.error('Error creating zone:', error);
      toast({
        title: 'Error',
        description: 'Failed to create delivery zone',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  return {
    loading,
    stats,
    zones,
    approvals,
    alerts,
    loadDashboardStats,
    loadDeliveryZones,
    loadDriverApprovals,
    loadPerformanceAlerts,
    approveDriver,
    rejectDriver,
    resolveAlert,
    createZone
  };
};
