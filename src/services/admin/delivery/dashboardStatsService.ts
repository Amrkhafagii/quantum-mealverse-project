
import { supabase } from '@/integrations/supabase/client';
import type { AdminDashboardStats } from '@/types/admin';

export class DashboardStatsService {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      // Get total drivers count
      const { count: totalDrivers } = await supabase
        .from('delivery_users')
        .select('*', { count: 'exact', head: true });

      // Get pending approvals count (use correct table!)
      const { count: pendingApprovals } = await supabase
        .from('driver_approval_workflow')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get active alerts count
      const { count: activeAlerts } = await supabase
        .from('delivery_performance_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_resolved', false);

      // Get delivery zones count
      const { count: totalZones } = await supabase
        .from('delivery_zones')
        .select('*', { count: 'exact', head: true });

      // Get today's deliveries count
      const today = new Date().toISOString().split('T')[0];
      const { count: todayDeliveries } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .eq('status', 'delivered');

      // Get average rating
      const { data: avgRatingData } = await supabase
        .from('delivery_users')
        .select('rating')
        .not('rating', 'is', null);

      const avgRating = avgRatingData?.length 
        ? avgRatingData.reduce((sum, user) => sum + (user.rating || 0), 0) / avgRatingData.length
        : 0;

      return {
        totalDrivers: totalDrivers || 0,
        pendingApprovals: pendingApprovals || 0,
        activeAlerts: activeAlerts || 0,
        totalZones: totalZones || 0,
        todayDeliveries: todayDeliveries || 0,
        avgRating: Math.round(avgRating * 100) / 100
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalDrivers: 0,
        pendingApprovals: 0,
        activeAlerts: 0,
        totalZones: 0,
        todayDeliveries: 0,
        avgRating: 0
      };
    }
  }
}

export const dashboardStatsService = new DashboardStatsService();

